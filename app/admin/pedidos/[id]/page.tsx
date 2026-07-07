import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Store,
  Truck,
  MapPin,
  CreditCard,
  Navigation,
} from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatarCentavos } from "@/lib/orders/fees";
import { PaymentStatusSelect } from "@/components/admin/PaymentStatusSelect";
import { InternalNotesField } from "@/components/admin/InternalNotesField";
import { WhatsAppMessageCard } from "@/components/admin/WhatsAppMessageCard";
import { ImageZoomButton } from "@/components/ui/ImageZoomButton";
import type { PaymentStatus } from "@/lib/types";

const NOMES_PAGAMENTO: Record<string, string> = {
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  pix: "Pix",
};

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("order").select("*").eq("id", id).single();
  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_item")
    .select("*, product:product_id(image_url)")
    .eq("order_id", id);

  const isEntrega = order.fulfillment_type === "entrega";

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/pedidos"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-brand-primary"
      >
        <ArrowLeft size={16} /> Voltar para Pedidos
      </Link>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Pedido #{order.order_number}</h1>
          <p className="text-xs text-neutral-500">
            {new Date(order.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <PaymentStatusSelect id={order.id} status={order.payment_status as PaymentStatus} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-600">Cliente</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <User size={16} className="shrink-0 text-neutral-400" />
                <span>{order.customer_name}</span>
              </div>
              <a
                href={`tel:${order.customer_phone}`}
                className="flex items-center gap-3 hover:text-brand-primary"
              >
                <Phone size={16} className="shrink-0 text-neutral-400" />
                <span>{order.customer_phone}</span>
              </a>
              <div className="flex items-center gap-3">
                {isEntrega ? (
                  <Truck size={16} className="shrink-0 text-neutral-400" />
                ) : (
                  <Store size={16} className="shrink-0 text-neutral-400" />
                )}
                <span>{isEntrega ? "Entrega" : "Retirada na loja"}</span>
              </div>
              {isEntrega && (
                <>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-neutral-400" />
                    <span>{order.delivery_address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Navigation size={16} className="shrink-0 text-neutral-400" />
                    <span>
                      {order.delivery_distance_km != null
                        ? `${Number(order.delivery_distance_km).toFixed(1)} km da loja`
                        : "Distância não calculada"}
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="shrink-0 text-neutral-400" />
                <span>{NOMES_PAGAMENTO[order.payment_method] ?? order.payment_method}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400">
                <Calendar size={16} className="shrink-0" />
                <span>{new Date(order.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-neutral-600">Itens</h2>
            <ul className="flex flex-col divide-y divide-neutral-100">
              {items?.map((item) => {
                const imageUrl = (item.product as { image_url: string | null } | null)?.image_url;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-2">
                    {imageUrl ? (
                      <ImageZoomButton
                        src={imageUrl}
                        alt={item.product_name}
                        thumbnailClassName="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-lg">
                        🛒
                      </div>
                    )}
                    <span className="flex-1 text-sm">
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="text-sm font-medium">
                      {formatarCentavos(item.line_total_cents)}
                    </span>
                  </li>
                );
              })}
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
        </div>

        <div className="flex flex-col gap-4">
          <WhatsAppMessageCard message={order.whatsapp_message} />
          <InternalNotesField id={order.id} initialNotes={order.internal_notes ?? ""} />
        </div>
      </div>
    </div>
  );
}
