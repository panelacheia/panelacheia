"use client";

import { Store, Truck } from "lucide-react";
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
        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
          value === "retirada"
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-neutral-300 bg-white text-neutral-700"
        }`}
      >
        <Store size={16} /> Retirada na loja
      </button>
      <button
        type="button"
        onClick={() => onChange("entrega")}
        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
          value === "entrega"
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-neutral-300 bg-white text-neutral-700"
        }`}
      >
        <Truck size={16} /> Entrega
      </button>
    </div>
  );
}
