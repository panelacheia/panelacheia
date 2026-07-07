import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { lojaEstaAberta } from "@/lib/orders/businessHours";
import { calcularTaxaEntrega, RETIRADA_FEE_CENTS } from "@/lib/orders/fees";
import { geocodeEndereco } from "@/lib/geo/nominatim";
import { distanciaAteALojaKm } from "@/lib/geo/haversine";
import { buildWhatsappMessage } from "@/lib/whatsapp/buildMessage";
import { buildWaLink } from "@/lib/whatsapp/waLink";
import type { CreateOrderRequest, CreateOrderResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  if (!lojaEstaAberta()) {
    return NextResponse.json(
      { error: "A loja está fechada no momento. Tente novamente durante o horário de funcionamento." },
      { status: 409 }
    );
  }

  const body = (await req.json()) as CreateOrderRequest;

  if (!body.items?.length || !body.customerName || !body.customerPhone) {
    return NextResponse.json({ error: "Dados do pedido incompletos." }, { status: 400 });
  }
  if (body.fulfillmentType === "entrega" && !body.delivery) {
    return NextResponse.json({ error: "Endereço de entrega é obrigatório." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Nunca confiar em preço/nome vindos do cliente: busca os dados reais e ativos no banco.
  const productIds = body.items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from("product")
    .select("*")
    .in("id", productIds)
    .eq("is_active", true);

  if (productsError || !products?.length) {
    return NextResponse.json({ error: "Não foi possível validar os produtos do pedido." }, { status: 400 });
  }

  const orderItems = body.items
    .map((reqItem) => {
      const product = products.find((p) => p.id === reqItem.productId);
      if (!product || reqItem.quantity <= 0) return null;
      const lineTotalCents = Math.round(product.price_cents * reqItem.quantity);
      return {
        product_id: product.id,
        product_name: product.name as string,
        unit: product.unit as string,
        unit_price_cents: product.price_cents as number,
        quantity: reqItem.quantity,
        line_total_cents: lineTotalCents,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (!orderItems.length) {
    return NextResponse.json({ error: "Nenhum item válido no pedido." }, { status: 400 });
  }

  const subtotalCents = orderItems.reduce((sum, i) => sum + i.line_total_cents, 0);

  let deliveryFeeCents = RETIRADA_FEE_CENTS;
  let deliveryAddress: string | undefined;
  let deliveryDistanceKm: number | null = null;
  let geocodeStatus: "n/a" | "ok" | "failed" = "n/a";
  let deliveryLat: number | null = null;
  let deliveryLng: number | null = null;

  if (body.fulfillmentType === "entrega" && body.delivery) {
    const d = body.delivery;
    deliveryAddress = `${d.street}, ${d.number}${d.complement ? " - " + d.complement : ""}, ${d.neighborhood}, ${d.city} - ${d.state}, ${d.cep}`;

    const coords = await geocodeEndereco(`${d.street}, ${d.number}, ${d.city}, ${d.state}, ${d.cep}, Brasil`);

    if (coords) {
      deliveryLat = coords.lat;
      deliveryLng = coords.lng;
      deliveryDistanceKm = distanciaAteALojaKm(coords);
      deliveryFeeCents = calcularTaxaEntrega(deliveryDistanceKm);
      geocodeStatus = "ok";
    } else {
      // Geocodificação falhou: não trava o pedido, aplica a taxa maior por segurança.
      geocodeStatus = "failed";
      deliveryFeeCents = calcularTaxaEntrega(Infinity);
    }
  }

  const totalCents = subtotalCents + deliveryFeeCents;

  // Insere primeiro (sem a mensagem final) para obter o order_number real da sequence,
  // depois monta o texto do WhatsApp já com o número certo e atualiza o registro.
  const { data: order, error: orderError } = await supabase
    .from("order")
    .insert({
      fulfillment_type: body.fulfillmentType,
      payment_method: body.paymentMethod,
      delivery_fee_cents: deliveryFeeCents,
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      delivery_cep: body.delivery?.cep ?? null,
      delivery_address: deliveryAddress ?? null,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      delivery_distance_km: deliveryDistanceKm,
      geocode_status: geocodeStatus,
      whatsapp_message: "",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Não foi possível criar o pedido. Tente novamente." }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_item").insert(
    orderItems.map((i) => ({ ...i, order_id: order.id }))
  );

  if (itemsError) {
    return NextResponse.json({ error: "Não foi possível salvar os itens do pedido." }, { status: 500 });
  }

  const whatsappMessage = buildWhatsappMessage({
    orderNumber: order.order_number,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    items: orderItems.map((i) => ({
      productName: i.product_name,
      unit: i.unit,
      unitPriceCents: i.unit_price_cents,
      quantity: i.quantity,
      lineTotalCents: i.line_total_cents,
    })),
    subtotalCents,
    fulfillmentType: body.fulfillmentType,
    deliveryAddress,
    deliveryDistanceKm,
    geocodeFailed: geocodeStatus === "failed",
    deliveryFeeCents,
    paymentMethod: body.paymentMethod,
    totalCents,
  });

  await supabase.from("order").update({ whatsapp_message: whatsappMessage }).eq("id", order.id);

  const response: CreateOrderResponse = {
    orderNumber: order.order_number,
    whatsappUrl: buildWaLink(whatsappMessage),
    totalCents,
  };

  return NextResponse.json(response);
}
