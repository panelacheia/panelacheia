"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🧾" },
  { href: "/admin/produtos", label: "Produtos", icon: "📦" },
  { href: "/admin/categorias", label: "Categorias", icon: "🏷️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-neutral-800 bg-[#0b1f45]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <Image src="/logos/panelacheia.png" alt="Panela Cheia" width={160} height={83} className="h-8 w-auto" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-primary text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
