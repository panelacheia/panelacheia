"use client";

import type { FulfillmentType } from "@/lib/types";

export function FulfillmentToggle({
  value,
  onChange,
}: {
  value: FulfillmentType;
  onChange: (value: FulfillmentType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange("retirada")}
        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
          value === "retirada"
            ? "border-brand-green bg-brand-green text-white"
            : "border-neutral-300 bg-white text-neutral-700"
        }`}
      >
        🏬 Retirada na loja
      </button>
      <button
        type="button"
        onClick={() => onChange("entrega")}
        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
          value === "entrega"
            ? "border-brand-green bg-brand-green text-white"
            : "border-neutral-300 bg-white text-neutral-700"
        }`}
      >
        📦 Entrega
      </button>
    </div>
  );
}
