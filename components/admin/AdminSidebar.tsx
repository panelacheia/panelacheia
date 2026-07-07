"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Package, Tags } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-neutral-800 bg-[#0b1f45]">
      <div className="flex items-center justify-center border-b border-white/10 px-4 py-5">
        <div className="rounded-lg bg-white px-3 py-2.5">
          <Image
            src="/logos/panelacheia.png"
            alt="Panela Cheia"
            width={160}
            height={83}
            className="h-12 w-auto"
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
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
              <Icon size={18} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="rounded-xl bg-white/10 px-3 py-3">
          <p className="text-xs text-white/50">Logado como</p>
          <p className="mb-3 text-sm font-semibold text-white">Gabriel Sato</p>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
