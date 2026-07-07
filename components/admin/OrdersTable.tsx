"use client";

import Link from "next/link";
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
            <th className="px-3 py-2">#</th>
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
              <td className="px-3 py-2">
                <Link href={`/admin/pedidos/${o.id}`} className="font-medium text-brand-primary hover:underline">
                  #{o.order_number}
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
