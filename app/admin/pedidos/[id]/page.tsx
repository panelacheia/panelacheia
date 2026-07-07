import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatarCentavos } from "@/lib/orders/fees";

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("order").select("*").eq("id", id).single();
  if (!order) notFound();

  const { data: items } = await supabase.from("order_item").select("*").eq("order_id", id);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Pedido #{order.order_number}</h1>

      <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
        <p><strong>Cliente:</strong> {order.customer_name}</p>
        <p><strong>Telefone:</strong> {order.customer_phone}</p>
        <p><strong>Data:</strong> {new Date(order.created_at).toLocaleString("pt-BR")}</p>
        <p><strong>Tipo:</strong> {order.fulfillment_type === "entrega" ? "Entrega" : "Retirada"}</p>
        {order.fulfillment_type === "entrega" && (
          <>
            <p><strong>Endereço:</strong> {order.delivery_address}</p>
            <p>
              <strong>Distância calculada:</strong>{" "}
              {order.delivery_distance_km != null
                ? `${Number(order.delivery_distance_km).toFixed(1)} km`
                : "não calculada"}{" "}
              ({order.geocode_status})
            </p>
          </>
        )}
        <p><strong>Pagamento:</strong> {order.payment_method}</p>
      </div>

      <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-600">Itens</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {items?.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.quantity}x {item.product_name}</span>
              <span>{formatarCentavos(item.line_total_cents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm">
          <span>Subtotal</span>
          <span>{formatarCentavos(order.subtotal_cents)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Taxa</span>
          <span>{formatarCentavos(order.delivery_fee_cents)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-neutral-200 pt-2 font-bold">
          <span>Total</span>
          <span>{formatarCentavos(order.total_cents)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-600">Mensagem enviada no WhatsApp</h2>
        <pre className="whitespace-pre-wrap text-sm text-neutral-700">{order.whatsapp_message}</pre>
      </div>
    </div>
  );
}
