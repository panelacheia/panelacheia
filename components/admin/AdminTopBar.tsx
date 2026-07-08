"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const PAGE_TITLES: { match: string; title: string }[] = [
  { match: "/admin/dashboard", title: "Dashboard" },
  { match: "/admin/pedidos", title: "Pedidos" },
  { match: "/admin/produtos", title: "Produtos" },
  { match: "/admin/categorias", title: "Categorias" },
];

export function AdminTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  const current = PAGE_TITLES.find(
    (p) => pathname === p.match || pathname?.startsWith(p.match + "/")
  );

  return (
    <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 lg:hidden"
      >
        <Menu size={22} />
      </button>
      <h1 className="text-lg font-bold text-neutral-800">{current?.title ?? "Painel"}</h1>
    </div>
  );
}
