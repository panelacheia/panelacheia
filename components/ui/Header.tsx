"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cartStore";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/panelacheia.jpg"
            alt="Panela Cheia Supermercado"
            width={1600}
            height={828}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <Link
          href="/carrinho"
          className="relative flex items-center gap-2 rounded-full bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark"
        >
          <span aria-hidden>🛒</span>
          <span>Carrinho</span>
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-secondary px-1 text-xs font-bold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
