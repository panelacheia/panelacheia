import { createClient } from "@/lib/supabase/server";
import { formatarCentavos } from "@/lib/orders/fees";
import { formatQuantidade } from "@/lib/orders/quantity";
import { formatarPercentual } from "@/lib/format";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatTile } from "@/components/admin/StatTile";
import { RankedBarCard, type RankedBarItem } from "@/components/admin/RankedBarCard";
import { toBrazilDateISO, brazilWeekdayLabel } from "@/lib/dates";
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
const WEEKDAY_ORDER = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-base font-bold text-neutral-800">{children}</h2>;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: ordersData } = await supabase
    .from("order")
    .select(
      "payment_status, total_cents, delivery_fee_cents, created_at, fulfillment_type, payment_method, geocode_status, customer_name, customer_phone"
    )
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
  const taxaCancelamentoPct = orders.length > 0 ? (porStatus.cancelado.length / orders.length) * 100 : 0;
  const freteArrecadadoCents = naoCancelados.reduce((sum, o) => sum + o.delivery_fee_cents, 0);

  const pedidosEntrega = naoCancelados.filter((o) => o.fulfillment_type === "entrega");
  const falhasGeocode = pedidosEntrega.filter((o) => o.geocode_status === "failed").length;

  // Gráfico de vendas por dia (últimos 14 dias)
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

  // Tipo de atendimento, com ticket médio de cada um
  const tipoGrupos = new Map<string, { count: number; totalCents: number }>();
  for (const o of naoCancelados) {
    const atual = tipoGrupos.get(o.fulfillment_type) ?? { count: 0, totalCents: 0 };
    tipoGrupos.set(o.fulfillment_type, {
      count: atual.count + 1,
      totalCents: atual.totalCents + o.total_cents,
    });
  }
  const tipoItems: RankedBarItem[] = Array.from(tipoGrupos.entries())
    .map(([tipo, v]) => ({
      key: tipo,
      label: FULFILLMENT_LABELS[tipo] ?? tipo,
      metricLabel: `${v.count} pedido${v.count === 1 ? "" : "s"} · média ${formatarCentavos(Math.round(v.totalCents / v.count))}`,
      valueCents: v.totalCents,
      barValue: v.count,
    }))
    .sort((a, b) => b.barValue - a.barValue);

  // Forma de pagamento
  const pagamentoGrupos = new Map<string, { count: number; totalCents: number }>();
  for (const o of naoCancelados) {
    const atual = pagamentoGrupos.get(o.payment_method) ?? { count: 0, totalCents: 0 };
    pagamentoGrupos.set(o.payment_method, {
      count: atual.count + 1,
      totalCents: atual.totalCents + o.total_cents,
    });
  }
  const pagamentoItems: RankedBarItem[] = Array.from(pagamentoGrupos.entries())
    .map(([metodo, v]) => ({
      key: metodo,
      label: PAYMENT_METHOD_LABELS[metodo] ?? metodo,
      metricLabel: `${v.count} pedido${v.count === 1 ? "" : "s"}`,
      valueCents: v.totalCents,
      barValue: v.count,
    }))
    .sort((a, b) => b.barValue - a.barValue);

  // Pedidos por dia da semana (ordem natural domingo→sábado, não por magnitude)
  const semanaGrupos = new Map<string, { count: number; totalCents: number }>();
  for (const o of naoCancelados) {
    const dia = brazilWeekdayLabel(new Date(o.created_at));
    const atual = semanaGrupos.get(dia) ?? { count: 0, totalCents: 0 };
    semanaGrupos.set(dia, { count: atual.count + 1, totalCents: atual.totalCents + o.total_cents });
  }
  const semanaItems: RankedBarItem[] = WEEKDAY_ORDER.filter((dia) => semanaGrupos.has(dia)).map((dia) => {
    const v = semanaGrupos.get(dia)!;
    return {
      key: dia,
      label: dia,
      metricLabel: `${v.count} pedido${v.count === 1 ? "" : "s"}`,
      valueCents: v.totalCents,
      barValue: v.count,
    };
  });

  // Clientes: únicos, taxa de recompra e melhores clientes por valor gasto
  const clientesGrupos = new Map<string, { nome: string; count: number; totalCents: number }>();
  for (const o of naoCancelados) {
    const atual = clientesGrupos.get(o.customer_phone) ?? {
      nome: o.customer_name,
      count: 0,
      totalCents: 0,
    };
    clientesGrupos.set(o.customer_phone, {
      nome: o.customer_name,
      count: atual.count + 1,
      totalCents: atual.totalCents + o.total_cents,
    });
  }
  const clientesUnicos = clientesGrupos.size;
  const clientesRecorrentes = Array.from(clientesGrupos.values()).filter((c) => c.count >= 2).length;
  const taxaRecompraPct = clientesUnicos > 0 ? (clientesRecorrentes / clientesUnicos) * 100 : 0;
  const melhoresClientes: RankedBarItem[] = Array.from(clientesGrupos.entries())
    .map(([telefone, v]) => ({
      key: telefone,
      label: v.nome,
      metricLabel: `${v.count} pedido${v.count === 1 ? "" : "s"}`,
      valueCents: v.totalCents,
      barValue: v.totalCents,
    }))
    .sort((a, b) => b.valueCents - a.valueCents)
    .slice(0, 5);

  // Produtos vendidos: mais vendidos (30 dias) e vendas por categoria (histórico completo)
  const { data: itemsData } = await supabase
    .from("order_item")
    .select(
      "product_name, unit, quantity, line_total_cents, order:order_id(created_at, payment_status), product:product_id(category:category_id(name))"
    )
    .limit(20000);

  const limiteMs = trintaDiasAtrasMs();
  const porProduto = new Map<string, { unit: string; quantity: number; revenueCents: number }>();
  const porCategoria = new Map<string, number>();
  for (const item of itemsData ?? []) {
    const order = item.order as unknown as {
      created_at: string;
      payment_status: PaymentStatus;
    } | null;
    if (!order || order.payment_status === "cancelado") continue;

    const categoria =
      (item.product as unknown as { category: { name: string } | null } | null)?.category?.name ??
      "Sem categoria";
    porCategoria.set(categoria, (porCategoria.get(categoria) ?? 0) + item.line_total_cents);

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

  const totalCategoriasCents = Array.from(porCategoria.values()).reduce((s, v) => s + v, 0);
  const categoriaItems: RankedBarItem[] = Array.from(porCategoria.entries())
    .map(([nome, totalCents]) => ({
      key: nome,
      label: nome,
      metricLabel:
        totalCategoriasCents > 0 ? formatarPercentual((totalCents / totalCategoriasCents) * 100) : "0%",
      valueCents: totalCents,
      barValue: totalCents,
    }))
    .sort((a, b) => b.valueCents - a.valueCents);

  // Resumo do catálogo
  const { data: productsData } = await supabase.from("product").select("is_active, is_promo");
  const produtos = productsData ?? [];
  const produtosAtivos = produtos.filter((p) => p.is_active).length;
  const produtosInativos = produtos.length - produtosAtivos;
  const produtosEmPromocao = produtos.filter((p) => p.is_promo).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionTitle>Pedidos</SectionTitle>
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Total vendido (exclui cancelados)"
            value={formatarCentavos(totalVendidoCents)}
            tone="primary"
          />
          <StatTile label="Ticket médio" value={formatarCentavos(ticketMedioCents)} tone="primary" />
          <StatTile
            label="Taxa de cancelamento"
            value={formatarPercentual(taxaCancelamentoPct)}
            tone={taxaCancelamentoPct > 15 ? "critical" : taxaCancelamentoPct > 5 ? "warning" : "good"}
          />
          <StatTile
            label="Frete arrecadado"
            value={formatarCentavos(freteArrecadadoCents)}
            tone="primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionTitle>Clientes</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatTile label="Clientes únicos" value={String(clientesUnicos)} tone="primary" />
          <StatTile
            label="Taxa de recompra"
            value={formatarPercentual(taxaRecompraPct)}
            secondary={`${clientesRecorrentes} cliente${clientesRecorrentes === 1 ? "" : "s"} voltou a comprar`}
            tone="primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionTitle>Operação e catálogo</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Falhas de localização"
            value={String(falhasGeocode)}
            secondary={
              pedidosEntrega.length > 0 ? `de ${pedidosEntrega.length} entregas` : "sem entregas ainda"
            }
            tone={falhasGeocode > 0 ? "warning" : "good"}
          />
          <StatTile label="Produtos ativos" value={String(produtosAtivos)} tone="good" />
          <StatTile label="Produtos inativos" value={String(produtosInativos)} tone="primary" />
          <StatTile label="Em promoção" value={String(produtosEmPromocao)} tone="primary" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionTitle>Vendas</SectionTitle>
        <RevenueChart data={chartData} />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <RankedBarCard title="Tipo de atendimento" items={tipoItems} />
          <RankedBarCard title="Forma de pagamento" items={pagamentoItems} />
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <RankedBarCard title="Vendas por categoria" items={categoriaItems} />
          <RankedBarCard title="Pedidos por dia da semana" items={semanaItems} />
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <RankedBarCard
            title="Mais vendidos (últimos 30 dias)"
            items={maisVendidos}
            emptyLabel="Nenhuma venda nos últimos 30 dias ainda."
          />
          <RankedBarCard
            title="Melhores clientes"
            items={melhoresClientes}
            emptyLabel="Nenhum pedido ainda."
          />
        </div>
      </div>
    </div>
  );
}
