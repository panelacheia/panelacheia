"use client";

import type { PaymentMethod } from "@/lib/types";

const OPTIONS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "cartao", label: "Cartão", icon: "💳" },
  { value: "dinheiro", label: "Dinheiro", icon: "💵" },
  { value: "pix", label: "Pix", icon: "🔑" },
];

export function PaymentMethodSelect({
  value,
  onChange,
}: {
  value: PaymentMethod | null;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-xl border px-2 py-3 text-sm font-semibold ${
            value === opt.value
              ? "border-brand-primary bg-brand-primary text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          <div className="text-lg">{opt.icon}</div>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
