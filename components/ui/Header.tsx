"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cartStore";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-20 bg-brand-green text-white shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-1 font-bold">
          <span className="text-lg">Panela Cheia</span>
          <span className="hidden text-xs font-normal text-white/80 sm:inline">
            Supermercado
          </span>
        </Link>

        <Link
          href="/carrinho"
          className="relative flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
        >
          <span aria-hidden>🛒</span>
          <span>Carrinho</span>
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-xs font-bold">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
