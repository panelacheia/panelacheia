"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Package, Tags, Images, X } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { MaintenanceToggle } from "./MaintenanceToggle";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/imagens", label: "Imagens", icon: Images },
];

export function AdminSidebar({
  open,
  onClose,
  maintenanceMode,
}: {
  open: boolean;
  onClose: () => void;
  maintenanceMode: boolean;
}) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-neutral-800 bg-[#0b1f45] transition-transform duration-200 lg:static lg:w-56 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center gap-2 border-b border-white/10 px-4 py-5">
          <div className="flex-1 rounded-lg bg-white px-3 py-2.5">
            <Image
              src="/logos/panelacheia.png"
              alt="Panela Cheia"
              width={160}
              height={83}
              className="mx-auto h-12 w-auto"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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

        <div className="px-3 pb-4">
          <MaintenanceToggle initialEnabled={maintenanceMode} />
        </div>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="rounded-xl bg-white/10 px-3 py-3">
            <p className="text-xs text-white/50">Logado como</p>
            <p className="mb-3 text-sm font-semibold text-white">MASTER</p>
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
