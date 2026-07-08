"use client";

import { useTransition } from "react";
import { updatePaymentStatus } from "@/lib/actions/orders";
import type { PaymentStatus } from "@/lib/types";

const STYLE: Record<PaymentStatus, string> = {
  pago: "bg-green-100 text-green-700 border-green-300",
  pendente: "bg-yellow-100 text-yellow-700 border-yellow-300",
  cancelado: "bg-red-100 text-brand-secondary border-red-300",
};

export function PaymentStatusSelect({ id, status }: { id: string; status: PaymentStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: PaymentStatus) {
    startTransition(async () => {
      await updatePaymentStatus(id, value);
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as PaymentStatus)}
      className={`rounded-full border px-3 py-1 text-sm font-semibold ${STYLE[status]}`}
    >
      <option value="pendente">Pendente</option>
      <option value="pago">Pago</option>
      <option value="cancelado">Cancelado</option>
    </select>
  );
}
