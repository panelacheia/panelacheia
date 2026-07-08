import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrdersFilterBar } from "@/components/admin/OrdersFilterBar";
import { todayBrazilISO, brazilDayStartISO, brazilDayEndISO } from "@/lib/dates";
import type { PaymentStatus } from "@/lib/types";

export const revalidate = 0;

function primeiroDiaMesISO() {
  return `${todayBrazilISO().slice(0, 7)}-01`;
}

function ultimoDiaMesISO() {
  const hoje = todayBrazilISO();
  const [ano, mes] = hoje.slice(0, 7).split("-").map(Number);
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate(); // dia 0 do próximo mês = último dia do atual
  return `${hoje.slice(0, 7)}-${String(ultimoDia).padStart(2, "0")}`;
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; payment?: string }>;
}) {
  const { from, to, payment } = await searchParams;

  // Sem parâmetros na URL ainda (primeira visita): usa o mês atual como padrão.
  // Depois que o usuário interage (Hoje/Tudo/Filtrar), from/to sempre vêm definidos
  // na URL (mesmo vazios, no caso de "Tudo"), então esse padrão não sobrescreve a escolha dele.
  const usandoPadrao = from === undefined && to === undefined;
  const efetivoFrom = usandoPadrao ? primeiroDiaMesISO() : from ?? "";
  const efetivoTo = usandoPadrao ? ultimoDiaMesISO() : to ?? "";
  const efetivoPayment = (payment ?? "") as PaymentStatus | "";

  const supabase = await createClient();

  let query = supabase
    .from("order")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (efetivoFrom) query = query.gte("created_at", brazilDayStartISO(efetivoFrom));
  if (efetivoTo) query = query.lte("created_at", brazilDayEndISO(efetivoTo));
  if (efetivoPayment) query = query.eq("payment_status", efetivoPayment);

  const { data: orders } = await query;

  return (
    <div>
      <OrdersFilterBar defaultFrom={efetivoFrom} defaultTo={efetivoTo} defaultPayment={efetivoPayment} />

      <p className="mb-3 text-sm text-neutral-500">
        {orders?.length ?? 0} pedido{orders?.length === 1 ? "" : "s"} encontrado
        {orders?.length === 1 ? "" : "s"}
        {efetivoFrom || efetivoTo || efetivoPayment ? " para o filtro selecionado" : ""}.
      </p>

      {!orders?.length ? (
        <p className="text-neutral-500">Nenhum pedido encontrado.</p>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
