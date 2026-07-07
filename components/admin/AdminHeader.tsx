"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

export function AdminHeader() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/admin/produtos" className="hover:text-brand-primary">
            Produtos
          </Link>
          <Link href="/admin/pedidos" className="hover:text-brand-primary">
            Pedidos
          </Link>
        </nav>
        <LogoutButton />
      </div>
    </header>
  );
}
