"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatarCentavos } from "@/lib/orders/fees";
import { deleteProduct, toggleProductField } from "@/lib/actions/products";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function ProductTable({ products }: { products: Product[] }) {
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleToggle(id: string, field: "is_active" | "is_promo", value: boolean) {
    setBusyId(id);
    startTransition(async () => {
      await toggleProductField(id, field, value);
      setBusyId(null);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setBusyId(id);
    startTransition(async () => {
      await deleteProduct(id);
      setBusyId(null);
      setDeleteTarget(null);
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
              <td className="px-3 py-2 text-neutral-600">{p.category_name}</td>
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
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/produtos/${p.id}/editar`}
                    aria-label={`Editar ${p.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-primary hover:bg-brand-primary/10"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Excluir ${p.name}`}
                    disabled={isPending && busyId === p.id}
                    onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-secondary hover:bg-brand-secondary/10 disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir produto"
        message={`Excluir "${deleteTarget?.name}"? Pedidos antigos que usaram esse produto não são afetados.`}
        busy={isPending && busyId === deleteTarget?.id}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
