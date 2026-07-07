import { createClient } from "@/lib/supabase/server";
import { formatarCentavos } from "@/lib/orders/fees";
import { RevenueChart } from "@/components/admin/RevenueChart";

export const revalidate = 0;

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("order")
    .select("created_at, total_cents, status")
    .neq("status", "cancelado")
    .order("created_at", { ascending: false })
    .limit(5000);

  const rows = orders ?? [];

  const totalCents = rows.reduce((sum, o) => sum + o.total_cents, 0);
  const orderCount = rows.length;
  const avgTicketCents = orderCount > 0 ? Math.round(totalCents / orderCount) : 0;

  const days = lastNDays(14);
  const totalsByDay = new Map<string, number>(days.map((d) => [d, 0]));
  for (const o of rows) {
    const day = o.created_at.slice(0, 10);
    if (totalsByDay.has(day)) {
      totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + o.total_cents);
    }
  }
  const chartData = days.map((date) => ({
    date,
    label: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    totalCents: totalsByDay.get(date) ?? 0,
  }));

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-medium text-neutral-500">Total vendido</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary-dark">
            {formatarCentavos(totalCents)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-medium text-neutral-500">Pedidos</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary-dark">{orderCount}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-medium text-neutral-500">Ticket médio</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary-dark">
            {formatarCentavos(avgTicketCents)}
          </p>
        </div>
      </div>

      <RevenueChart data={chartData} />
    </div>
  );
}
