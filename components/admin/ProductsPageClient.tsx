"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { normalize } from "@/lib/normalize";
import { ProductTable } from "./ProductTable";

export function ProductsPageClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = normalize(search);
    if (!term) return products;
    return products.filter((p) => normalize(p.name).includes(term));
  }, [products, search]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
        />
        <Link
          href="/admin/produtos/novo"
          className="whitespace-nowrap rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark"
        >
          + Novo Produto
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-neutral-500">Nenhum produto encontrado.</p>
      ) : (
        <ProductTable products={filtered} />
      )}
    </div>
  );
}
