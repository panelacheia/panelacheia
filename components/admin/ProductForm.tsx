"use client";

import { useState, useTransition } from "react";
import type { Product } from "@/lib/types";

export function ProductForm({
  product,
  action,
}: {
  product?: Product;
  action: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao salvar produto.");
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none";

  return (
    <form action={handleSubmit} className="flex max-w-lg flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Nome</label>
        <input name="name" defaultValue={product?.name} required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Preço (R$)</label>
          <input
            name="price"
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            required
            inputMode="decimal"
            placeholder="0,00"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Unidade</label>
          <input
            name="unit"
            defaultValue={product?.unit}
            required
            placeholder="kg, un, pacote 500g..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Categoria</label>
        <input
          name="category"
          defaultValue={product?.category}
          required
          placeholder="Hortifruti, Açougue, Mercearia..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Foto do produto {product?.image_url && "(deixe em branco para manter a atual)"}
        </label>
        {product?.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt="" className="mb-2 h-16 w-16 rounded object-cover" />
        )}
        <input name="image" type="file" accept="image/*" className="text-sm" />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
          Ativo (visível no catálogo)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_promo" defaultChecked={product?.is_promo ?? false} />
          Promoção
        </label>
      </div>

      {erro && <p className="text-sm text-brand-red">{erro}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-brand-green px-4 py-2 font-semibold text-white hover:bg-brand-green-dark disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
