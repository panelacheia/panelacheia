"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { formatarCentavos } from "@/lib/orders/fees";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
import type { PaymentStatus } from "@/lib/types";

type OrderRow = {
  id: string;
  order_number: number;
  created_at: string;
  customer_name: string;
  fulfillment_type: string;
  total_cents: number;
  status: string;
  payment_status: PaymentStatus;
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-3 py-2" colSpan={2}>
              #
            </th>
            <th className="px-3 py-2">Data</th>
            <th className="px-3 py-2">Cliente</th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Pagamento</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-neutral-100 last:border-0">
              <td className="py-2 pl-3 pr-1 font-medium text-neutral-700">#{o.order_number}</td>
              <td className="py-2 pl-1 pr-3">
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-brand-primary px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  <Eye size={14} />
                  Ver pedido
                </Link>
              </td>
              <td className="px-3 py-2 text-neutral-600">
                {new Date(o.created_at).toLocaleString("pt-BR")}
              </td>
              <td className="px-3 py-2">{o.customer_name}</td>
              <td className="px-3 py-2 capitalize">{o.fulfillment_type}</td>
              <td className="px-3 py-2">{formatarCentavos(o.total_cents)}</td>
              <td className="px-3 py-2">
                <PaymentStatusSelect id={o.id} status={o.payment_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
