"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatarCentavos } from "@/lib/orders/fees";
import { deleteProduct, toggleProductField } from "@/lib/actions/products";

export function ProductTable({ products }: { products: Product[] }) {
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function handleToggle(id: string, field: "is_active" | "is_promo", value: boolean) {
    setBusyId(id);
    startTransition(async () => {
      await toggleProductField(id, field, value);
      setBusyId(null);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"? Pedidos antigos que usaram esse produto não são afetados.`)) return;
    setBusyId(id);
    startTransition(async () => {
      await deleteProduct(id);
      setBusyId(null);
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-3 py-2">Produto</th>
            <th className="px-3 py-2">Categoria</th>
            <th className="px-3 py-2">Preço</th>
            <th className="px-3 py-2">Ativo</th>
            <th className="px-3 py-2">Promoção</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-neutral-100 last:border-0">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-neutral-100" />
                  )}
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-neutral-400">{p.unit}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2 text-neutral-600">{p.category}</td>
              <td className="px-3 py-2">{formatarCentavos(p.price_cents)}</td>
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={p.is_active}
                  disabled={isPending && busyId === p.id}
                  onChange={(e) => handleToggle(p.id, "is_active", e.target.checked)}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={p.is_promo}
                  disabled={isPending && busyId === p.id}
                  onChange={(e) => handleToggle(p.id, "is_promo", e.target.checked)}
                />
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/produtos/${p.id}/editar`} className="text-brand-green hover:underline">
                    Editar
                  </Link>
                  <button
                    type="button"
                    disabled={isPending && busyId === p.id}
                    onClick={() => handleDelete(p.id, p.name)}
                    className="text-brand-red hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
