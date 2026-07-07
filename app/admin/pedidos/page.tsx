import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatarCentavos } from "@/lib/orders/fees";

export const revalidate = 0;

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("order")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Pedidos</h1>

      {!orders?.length ? (
        <p className="text-neutral-500">Nenhum pedido ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2">
                    <Link href={`/admin/pedidos/${o.id}`} className="font-medium text-brand-green hover:underline">
                      #{o.order_number}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-neutral-600">
                    {new Date(o.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-3 py-2">{o.customer_name}</td>
                  <td className="px-3 py-2 capitalize">{o.fulfillment_type}</td>
                  <td className="px-3 py-2">{formatarCentavos(o.total_cents)}</td>
                  <td className="px-3 py-2 capitalize">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
