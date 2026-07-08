"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Filter, CreditCard } from "lucide-react";
import { todayBrazilISO } from "@/lib/dates";
import type { PaymentStatus } from "@/lib/types";

export function OrdersFilterBar({
  defaultFrom,
  defaultTo,
  defaultPayment,
}: {
  defaultFrom: string;
  defaultTo: string;
  defaultPayment: PaymentStatus | "";
}) {
  const router = useRouter();

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [payment, setPayment] = useState<PaymentStatus | "">(defaultPayment);

  function aplicar(novoFrom: string, novoTo: string, novoPayment: PaymentStatus | "") {
    const params = new URLSearchParams();
    params.set("from", novoFrom);
    params.set("to", novoTo);
    params.set("payment", novoPayment);
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  function handleHoje() {
    const hoje = todayBrazilISO();
    setFrom(hoje);
    setTo(hoje);
    aplicar(hoje, hoje, payment);
  }

  function handleTudo() {
    setFrom("");
    setTo("");
    setPayment("");
    aplicar("", "", "");
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-sm text-neutral-600">
        <Calendar size={16} className="text-neutral-400" />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
        />
      </div>
      <span className="text-sm text-neutral-400">até</span>
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <CreditCard size={16} className="text-neutral-400" />
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value as PaymentStatus | "")}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
        >
          <option value="">Todos os pagamentos</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <button
        type="button"
        onClick={handleHoje}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
      >
        Hoje
      </button>
      <button
        type="button"
        onClick={handleTudo}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
      >
        Tudo
      </button>

      <button
        type="button"
        onClick={() => aplicar(from, to, payment)}
        className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-primary-dark"
      >
        <Filter size={14} />
        Filtrar
      </button>
    </div>
  );
}
