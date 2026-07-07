import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrdersFilterBar } from "@/components/admin/OrdersFilterBar";

export const revalidate = 0;

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("order")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (from) query = query.gte("created_at", `${from}T00:00:00`);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);

  const { data: orders } = await query;

  return (
    <div>
      <OrdersFilterBar />

      <p className="mb-3 text-sm text-neutral-500">
        {orders?.length ?? 0} pedido{orders?.length === 1 ? "" : "s"} encontrado
        {orders?.length === 1 ? "" : "s"}
        {from || to ? " no período selecionado" : ""}.
      </p>

      {!orders?.length ? (
        <p className="text-neutral-500">Nenhum pedido encontrado.</p>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
