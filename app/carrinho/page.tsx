"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cartStore";
import { formatarCentavos } from "@/lib/orders/fees";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, subtotalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-neutral-600">Seu carrinho está vazio.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-brand-primary px-4 py-2 font-semibold text-white hover:bg-brand-primary-dark"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Seu carrinho</h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3 shadow-sm"
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-2xl">
                🛒
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-neutral-500">
                {formatarCentavos(item.unitPriceCents)} / {item.unit}
              </p>
            </div>

            <div className="flex items-center rounded-lg border border-neutral-300">
              <button
                type="button"
                className="px-2 py-1 text-neutral-600"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                className="px-2 py-1 text-neutral-600"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <p className="w-20 text-right text-sm font-semibold">
              {formatarCentavos(item.unitPriceCents * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-neutral-400 hover:text-brand-secondary"
              aria-label="Remover item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <span className="font-medium">Subtotal</span>
        <span className="text-lg font-bold">{formatarCentavos(subtotalCents)}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/checkout"
          className="block rounded-xl bg-brand-primary px-4 py-3 text-center font-semibold text-white hover:bg-brand-primary-dark"
        >
          Finalizar pedido
        </Link>
        <Link
          href="/"
          className="block rounded-xl border border-brand-primary px-4 py-3 text-center font-semibold text-brand-primary hover:bg-brand-primary/5"
        >
          Adicionar mais produtos
        </Link>
      </div>
    </div>
  );
}
