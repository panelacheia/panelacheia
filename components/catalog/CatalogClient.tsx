"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { normalize } from "@/lib/normalize";
import { ProductCard } from "./ProductCard";

export function CatalogClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const filtered = useMemo(() => {
    const term = normalize(search);
    return products.filter((p) => {
      const matchesSearch = term === "" || normalize(p.name).includes(term);
      const matchesCategory = !category || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto (ex: arroz, açúcar, picanha)"
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
            category === null
              ? "bg-brand-primary text-white"
              : "bg-white text-neutral-700 border border-neutral-300"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
              category === cat
                ? "bg-brand-primary text-white"
                : "bg-white text-neutral-700 border border-neutral-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">
          Nenhum produto encontrado para essa busca.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
