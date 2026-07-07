import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrdersFilterBar } from "@/components/admin/OrdersFilterBar";

export const revalidate = 0;

function primeiroDiaMesISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function ultimoDiaMesISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;

  // Sem parâmetros na URL ainda (primeira visita): usa o mês atual como padrão.
  // Depois que o usuário interage (Hoje/Tudo/Filtrar), from/to sempre vêm definidos
  // na URL (mesmo vazios, no caso de "Tudo"), então esse padrão não sobrescreve a escolha dele.
  const usandoPadrao = from === undefined && to === undefined;
  const efetivoFrom = usandoPadrao ? primeiroDiaMesISO() : from ?? "";
  const efetivoTo = usandoPadrao ? ultimoDiaMesISO() : to ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("order")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (efetivoFrom) query = query.gte("created_at", `${efetivoFrom}T00:00:00`);
  if (efetivoTo) query = query.lte("created_at", `${efetivoTo}T23:59:59`);

  const { data: orders } = await query;

  return (
    <div>
      <OrdersFilterBar defaultFrom={efetivoFrom} defaultTo={efetivoTo} />

      <p className="mb-3 text-sm text-neutral-500">
        {orders?.length ?? 0} pedido{orders?.length === 1 ? "" : "s"} encontrado
        {orders?.length === 1 ? "" : "s"}
        {efetivoFrom || efetivoTo ? " no período selecionado" : ""}.
      </p>

      {!orders?.length ? (
        <p className="text-neutral-500">Nenhum pedido encontrado.</p>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
