"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Filter } from "lucide-react";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export function OrdersFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function aplicar(novoFrom: string, novoTo: string) {
    const params = new URLSearchParams();
    if (novoFrom) params.set("from", novoFrom);
    if (novoTo) params.set("to", novoTo);
    router.push(`/admin/pedidos${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleHoje() {
    const hoje = hojeISO();
    setFrom(hoje);
    setTo(hoje);
    aplicar(hoje, hoje);
  }

  function handleTudo() {
    setFrom("");
    setTo("");
    aplicar("", "");
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
        onClick={() => aplicar(from, to)}
        className="ml-auto flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-primary-dark"
      >
        <Filter size={14} />
        Filtrar
      </button>
    </div>
  );
}
