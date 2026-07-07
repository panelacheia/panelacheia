"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatarCentavos } from "@/lib/orders/fees";
import { useCart } from "@/lib/cart/cartStore";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      unitPriceCents: product.price_cents,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
      <div className="relative aspect-square bg-neutral-100">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🛒</div>
        )}
        {product.is_promo && (
          <span className="absolute left-2 top-2 rounded-md bg-brand-secondary px-2 py-0.5 text-xs font-bold text-white">
            Promoção
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="line-clamp-2 text-sm font-medium leading-tight">{product.name}</p>
          <p className="text-xs text-neutral-500">{product.unit}</p>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <p className="text-lg font-bold text-brand-primary-dark">
            {formatarCentavos(product.price_cents)}
          </p>
          {product.is_promo && product.original_price_cents && (
            <p className="text-xs text-neutral-400 line-through">
              {formatarCentavos(product.original_price_cents)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 rounded-lg bg-brand-primary px-2 py-1.5 text-sm font-semibold text-white hover:bg-brand-primary-dark"
          >
            {added ? "Adicionado ✓" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
