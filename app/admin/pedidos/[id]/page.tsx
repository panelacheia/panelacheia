import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatarCentavos } from "@/lib/orders/fees";
import { PaymentStatusSelect } from "@/components/admin/PaymentStatusSelect";
import { InternalNotesField } from "@/components/admin/InternalNotesField";
import type { PaymentStatus } from "@/lib/types";

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
    <div className="max-w-5xl">
      <Link
        href="/admin/pedidos"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-brand-primary"
      >
        <ArrowLeft size={16} /> Voltar para Pedidos
      </Link>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Pedido #{order.order_number}</h1>
        <PaymentStatusSelect id={order.id} status={order.payment_status as PaymentStatus} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
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

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
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
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-neutral-600">Mensagem enviada no WhatsApp</h2>
            <pre className="whitespace-pre-wrap text-sm text-neutral-700">{order.whatsapp_message}</pre>
          </div>

          <InternalNotesField id={order.id} initialNotes={order.internal_notes ?? ""} />
        </div>
      </div>
    </div>
  );
}
