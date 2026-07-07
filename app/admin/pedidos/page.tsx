import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const revalidate = 0;

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("order")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return !orders?.length ? (
    <p className="text-neutral-500">Nenhum pedido ainda.</p>
  ) : (
    <OrdersTable orders={orders} />
  );
}
