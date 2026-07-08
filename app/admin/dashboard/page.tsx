import { createClient } from "@/lib/supabase/server";
import { formatarCentavos } from "@/lib/orders/fees";
import { formatQuantidade } from "@/lib/orders/quantity";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatTile } from "@/components/admin/StatTile";
import { RankedBarCard, type RankedBarItem } from "@/components/admin/RankedBarCard";
import { toBrazilDateISO } from "@/lib/dates";
import type { PaymentStatus } from "@/lib/types";

export const revalidate = 0;

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    days.push(toBrazilDateISO(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)));
  }
  return days;
}

function trintaDiasAtrasMs(): number {
  return Date.now() - 30 * 24 * 60 * 60 * 1000;
}

const FULFILLMENT_LABELS: Record<string, string> = { retirada: "Retirada", entrega: "Entrega" };
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  pix: "Pix",
};

function contarPorChave<T extends { total_cents: number }>(
  orders: T[],
  chave: (o: T) => string,
  labels: Record<string, string>
): RankedBarItem[] {
  const grupos = new Map<string, { count: number; totalCents: number }>();
  for (const o of orders) {
    const k = chave(o);
    const atual = grupos.get(k) ?? { count: 0, totalCents: 0 };
    grupos.set(k, { count: atual.count + 1, totalCents: atual.totalCents + o.total_cents });
  }
  return Array.from(grupos.entries())
    .map(([k, v]) => ({
      key: k,
      label: labels[k] ?? k,
      metricLabel: `${v.count} pedido${v.count === 1 ? "" : "s"}`,
      valueCents: v.totalCents,
      barValue: v.count,
    }))
    .sort((a, b) => b.barValue - a.barValue);
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: ordersData } = await supabase
    .from("order")
    .select("payment_status, total_cents, created_at, fulfillment_type, payment_method")
    .order("created_at", { ascending: false })
    .limit(5000);

  const orders = ordersData ?? [];
  // "status" (novo/confirmado/cancelado) nunca é atualizado pelo app — quem manda de verdade
  // é payment_status. Cancelamento de pedido é payment_status = "cancelado".
  const naoCancelados = orders.filter((o) => o.payment_status !== "cancelado");

  const porStatus: Record<PaymentStatus, typeof orders> = { pago: [], pendente: [], cancelado: [] };
  for (const o of orders) porStatus[o.payment_status as PaymentStatus]?.push(o);

  const somaCentavos = (list: { total_cents: number }[]) =>
    list.reduce((sum, o) => sum + o.total_cents, 0);

  const totalVendidoCents = somaCentavos(naoCancelados);
  const ticketMedioCents =
    naoCancelados.length > 0 ? Math.round(totalVendidoCents / naoCancelados.length) : 0;

  const days = lastNDays(14);
  const totalsByDay = new Map<string, number>(days.map((d) => [d, 0]));
  for (const o of naoCancelados) {
    const day = toBrazilDateISO(new Date(o.created_at));
    if (totalsByDay.has(day)) {
      totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + o.total_cents);
    }
  }
  const chartData = days.map((date) => ({
    date,
    label: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    totalCents: totalsByDay.get(date) ?? 0,
  }));

  const tipoItems = contarPorChave(naoCancelados, (o) => o.fulfillment_type, FULFILLMENT_LABELS);
  const pagamentoItems = contarPorChave(naoCancelados, (o) => o.payment_method, PAYMENT_METHOD_LABELS);

  const { data: itemsData } = await supabase
    .from("order_item")
    .select("product_name, unit, quantity, line_total_cents, order:order_id(created_at, payment_status)")
    .limit(20000);

  const limiteMs = trintaDiasAtrasMs();
  const porProduto = new Map<string, { unit: string; quantity: number; revenueCents: number }>();
  for (const item of itemsData ?? []) {
    const order = item.order as unknown as {
      created_at: string;
      payment_status: PaymentStatus;
    } | null;
    if (!order || order.payment_status === "cancelado") continue;
    if (new Date(order.created_at).getTime() < limiteMs) continue;

    const atual = porProduto.get(item.product_name) ?? {
      unit: item.unit,
      quantity: 0,
      revenueCents: 0,
    };
    porProduto.set(item.product_name, {
      unit: item.unit,
      quantity: atual.quantity + Number(item.quantity),
      revenueCents: atual.revenueCents + item.line_total_cents,
    });
  }
  const maisVendidos: RankedBarItem[] = Array.from(porProduto.entries())
    .map(([name, v]) => ({
      key: name,
      label: name,
      metricLabel: formatQuantidade(v.quantity, v.unit),
      valueCents: v.revenueCents,
      barValue: v.revenueCents,
    }))
    .sort((a, b) => b.valueCents - a.valueCents)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Total de pedidos"
          value={String(orders.length)}
          secondary={formatarCentavos(somaCentavos(orders))}
          tone="primary"
        />
        <StatTile
          label="Pagos"
          value={String(porStatus.pago.length)}
          secondary={formatarCentavos(somaCentavos(porStatus.pago))}
          tone="good"
        />
        <StatTile
          label="Pendentes"
          value={String(porStatus.pendente.length)}
          secondary={formatarCentavos(somaCentavos(porStatus.pendente))}
          tone="warning"
        />
        <StatTile
          label="Cancelados"
          value={String(porStatus.cancelado.length)}
          secondary={formatarCentavos(somaCentavos(porStatus.cancelado))}
          tone="critical"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatTile
          label="Total vendido (exclui cancelados)"
          value={formatarCentavos(totalVendidoCents)}
          tone="primary"
        />
        <StatTile label="Ticket médio" value={formatarCentavos(ticketMedioCents)} tone="primary" />
      </div>

      <RevenueChart data={chartData} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <RankedBarCard title="Tipo de atendimento" items={tipoItems} />
        <RankedBarCard title="Forma de pagamento" items={pagamentoItems} />
      </div>

      <RankedBarCard
        title="Mais vendidos (últimos 30 dias)"
        items={maisVendidos}
        emptyLabel="Nenhuma venda nos últimos 30 dias ainda."
      />
    </div>
  );
}
