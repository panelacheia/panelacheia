"use client";

import { useState } from "react";
import { formatarCentavos } from "@/lib/orders/fees";

type DayPoint = { date: string; label: string; totalCents: number };

export function RevenueChart({ data }: { data: DayPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.totalCents));

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
      <h2 className="mb-3 inline-block rounded-md bg-brand-primary px-2 py-1 text-xs font-semibold text-white">
        Vendas nos últimos 14 dias
      </h2>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="relative flex h-28 items-end gap-1.5">
            {data.map((d, i) => {
              const heightPct = (d.totalCents / max) * 100;
              return (
                <div
                  key={d.date}
                  className="group relative flex h-full flex-1 items-end"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className="w-full rounded-t bg-brand-primary transition-opacity group-hover:opacity-80"
                    style={{ height: `${Math.max(heightPct, d.totalCents > 0 ? 2 : 0)}%` }}
                  />
                  {hovered === i && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-lg bg-neutral-900 px-2 py-1 text-xs text-white shadow-lg">
                      <p className="font-semibold">{formatarCentavos(d.totalCents)}</p>
                      <p className="text-neutral-300">{d.label}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex gap-1.5 text-[10px] text-neutral-400">
            {data.map((d) => (
              <span key={d.date} className="flex-1 text-center">
                {d.label.slice(0, 5)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
