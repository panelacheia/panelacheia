"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, X, CheckCircle2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatarCentavos } from "@/lib/orders/fees";
import { useCart } from "@/lib/cart/cartStore";
import { WeightSelector } from "@/components/ui/WeightSelector";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isKg = product.unit === "kg";
  const [quantity, setQuantity] = useState(1);
  const [fotoAmpliada, setFotoAmpliada] = useState(false);
  const [pesoModalAberto, setPesoModalAberto] = useState(false);
  const [peso, setPeso] = useState(1);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [fotoComErro, setFotoComErro] = useState(false);

  function addToCart(qty: number) {
    addItem({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      unitPriceCents: product.price_cents,
      quantity: qty,
      imageUrl: product.image_url,
    });
    setFotoAmpliada(false);
    setPesoModalAberto(false);
    setConfirmacaoAberta(true);
  }

  function handleAdicionarClick() {
    if (isKg) {
      setPeso(1);
      setFotoAmpliada(false);
      setPesoModalAberto(true);
    } else {
      addToCart(quantity);
    }
  }

  const quantidadeStepper = (
    <div className="flex items-center rounded-lg border border-neutral-300">
      <button
        type="button"
        className="px-2 py-1 text-neutral-600"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <span className="min-w-6 text-center text-sm">{quantity}</span>
      <button
        type="button"
        className="px-2 py-1 text-neutral-600"
        onClick={() => setQuantity((q) => q + 1)}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => product.image_url && !fotoComErro && setFotoAmpliada(true)}
        className="relative aspect-square bg-neutral-100"
        aria-label={`Ver foto ampliada de ${product.name}`}
      >
        {product.image_url && !fotoComErro ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setFotoComErro(true)}
            className="absolute inset-0 h-full w-full object-contain p-2"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <ShoppingCart size={40} />
          </div>
        )}
        {product.is_promo && (
          <span className="absolute left-2 top-2 rounded-md bg-brand-secondary px-2 py-0.5 text-xs font-bold text-white">
            Promoção
          </span>
        )}
      </button>

      {fotoAmpliada && product.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setFotoAmpliada(false)}
        >
          <div className="flex max-h-full w-full max-w-sm flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-[65vh] w-full rounded-t-xl bg-white object-contain"
              />
              <button
                type="button"
                onClick={() => setFotoAmpliada(false)}
                aria-label="Fechar"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-b-xl bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-neutral-500">{product.unit}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-brand-primary-dark">
                  {formatarCentavos(product.price_cents)}
                </p>
                {product.is_promo && product.original_price_cents && (
                  <p className="text-xs text-brand-secondary line-through">
                    {formatarCentavos(product.original_price_cents)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {quantidadeStepper}

                <button
                  type="button"
                  onClick={handleAdicionarClick}
                  className="flex-1 rounded-lg bg-brand-primary px-2 py-1.5 text-sm font-semibold text-white hover:bg-brand-primary-dark"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="line-clamp-2 min-h-[2.25rem] text-sm font-medium leading-tight">{product.name}</p>
          <p className="text-xs text-neutral-500">{product.unit}</p>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <p className="text-lg font-bold text-brand-primary-dark">
            {formatarCentavos(product.price_cents)}
          </p>
          {product.is_promo && product.original_price_cents && (
            <p className="text-xs text-brand-secondary line-through">
              {formatarCentavos(product.original_price_cents)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {quantidadeStepper}

          <button
            type="button"
            onClick={handleAdicionarClick}
            className="flex-1 rounded-lg bg-brand-primary px-2 py-1.5 text-sm font-semibold text-white hover:bg-brand-primary-dark"
          >
            Adicionar
          </button>
        </div>
      </div>

      {pesoModalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPesoModalAberto(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300">
                  <ShoppingCart size={20} />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-neutral-500">
                  {formatarCentavos(product.price_cents)} / kg
                </p>
              </div>
            </div>

            <label className="mb-2 block text-xs font-medium text-neutral-600">
              Quanto você quer?
            </label>
            <WeightSelector value={peso} onChange={setPeso} />

            <p className="mt-3 text-sm text-neutral-600">
              Total: <span className="font-bold text-brand-primary-dark">
                {formatarCentavos(product.price_cents * peso)}
              </span>
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => addToCart(peso)}
                className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark"
              >
                Adicionar ao carrinho
              </button>
              <button
                type="button"
                onClick={() => setPesoModalAberto(false)}
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:bg-neutral-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmacaoAberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmacaoAberta(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300">
                  <ShoppingCart size={20} />
                </div>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-sm font-semibold text-brand-primary">
                  <CheckCircle2 size={16} /> Adicionado ao carrinho
                </p>
                <p className="truncate text-sm text-neutral-600">{product.name}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setConfirmacaoAberta(false)}
                className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark"
              >
                Continuar comprando
              </button>
              <Link
                href="/carrinho"
                className="block rounded-lg border border-neutral-300 px-4 py-2.5 text-center text-sm font-medium hover:bg-neutral-100"
              >
                Ver carrinho
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
