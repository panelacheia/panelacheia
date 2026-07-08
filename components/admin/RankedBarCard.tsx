import { formatarCentavos } from "@/lib/orders/fees";

export type RankedBarItem = {
  key: string;
  label: string;
  metricLabel: string;
  valueCents: number;
  barValue: number;
};

export function RankedBarCard({
  title,
  items,
  emptyLabel = "Sem dados nesse período.",
}: {
  title: string;
  items: RankedBarItem[];
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.barValue));

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 inline-block rounded-md bg-brand-primary px-2.5 py-1.5 text-sm font-semibold text-white">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.key}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-base">
                <span className="truncate font-semibold text-neutral-900">{item.label}</span>
                <span className="shrink-0 font-medium text-neutral-600">
                  {item.metricLabel} · {formatarCentavos(item.valueCents)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-brand-primary"
                  style={{ width: `${(item.barValue / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
