"use client";

import { CreditCard, Banknote, Zap, type LucideIcon } from "lucide-react";
import type { PaymentMethod } from "@/lib/types";

const OPTIONS: { value: PaymentMethod; label: string; icon: LucideIcon }[] = [
  { value: "cartao", label: "Cartão", icon: CreditCard },
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "pix", label: "Pix", icon: Zap },
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
          className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-semibold ${
            value === opt.value
              ? "border-brand-primary bg-brand-primary text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          <opt.icon size={20} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
