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
  const [nome, setNome] = useState(product?.name ?? "");
  const [categoria, setCategoria] = useState(product?.category ?? "");
  const [autoImageUrl, setAutoImageUrl] = useState<string | null>(null);
  const [buscandoImagem, setBuscandoImagem] = useState(false);

  async function handleBuscarImagem() {
    if (!nome.trim()) {
      setErro("Digite o nome do produto antes de buscar a foto.");
      return;
    }
    setErro(null);
    setBuscandoImagem(true);
    try {
      const res = await fetch("/api/admin/product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, category: categoria }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível buscar a imagem.");
      setAutoImageUrl(data.url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível buscar a imagem.");
    } finally {
      setBuscandoImagem(false);
    }
  }

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
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none";

  return (
    <form action={handleSubmit} className="flex max-w-lg flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Nome</label>
        <input
          name="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className={inputClass}
        />
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
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
          placeholder="Hortifruti, Açougue, Mercearia..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Foto do produto {product?.image_url && "(deixe em branco para manter a atual)"}
        </label>

        {(autoImageUrl ?? product?.image_url) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={autoImageUrl ?? product?.image_url ?? ""}
            alt=""
            className="mb-2 h-16 w-16 rounded object-cover"
          />
        )}

        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleBuscarImagem}
            disabled={buscandoImagem}
            className="rounded-lg border border-brand-primary px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-60"
          >
            {buscandoImagem ? "Buscando..." : "Buscar foto automática"}
          </button>
          {autoImageUrl && (
            <span className="text-xs text-neutral-500">Imagem encontrada — confira antes de salvar.</span>
          )}
        </div>

        <input name="image" type="file" accept="image/*" className="text-sm" />
        <input type="hidden" name="auto_image_url" value={autoImageUrl ?? ""} />
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

      {erro && <p className="text-sm text-brand-secondary">{erro}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-brand-primary px-4 py-2 font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
