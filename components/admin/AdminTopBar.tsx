"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: { match: string; title: string }[] = [
  { match: "/admin/dashboard", title: "Dashboard" },
  { match: "/admin/pedidos", title: "Pedidos" },
  { match: "/admin/produtos", title: "Produtos" },
  { match: "/admin/categorias", title: "Categorias" },
];

export function AdminTopBar() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  const current = PAGE_TITLES.find(
    (p) => pathname === p.match || pathname?.startsWith(p.match + "/")
  );

  return (
    <div className="border-b border-neutral-200 bg-white px-6 py-4">
      <h1 className="text-sm font-semibold text-neutral-700">{current?.title ?? "Painel"}</h1>
    </div>
  );
}
