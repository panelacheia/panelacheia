"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Clock, MapPin, Phone } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "./SocialIcons";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-neutral-200 bg-[#0b1f45] text-white/80">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="inline-block rounded-lg bg-white px-3 py-2">
                <Image
                  src="/logos/panelacheia.png"
                  alt="Panela Cheia"
                  width={1600}
                  height={828}
                  className="h-10 w-auto"
                />
              </div>
              <a
                href="https://www.instagram.com/panelacheia_bauru"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://www.facebook.com/panelacheiabauru"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <FacebookIcon size={18} />
              </a>
            </div>
            <p className="text-sm text-white/60">
              Frescor e qualidade todos os dias, direto pra sua casa.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">Horário de funcionamento</h3>
            <ul className="flex flex-col gap-1.5 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Clock size={14} className="shrink-0" />
                Segunda a sábado: 8h às 20h
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="shrink-0" />
                Domingo: 8h às 13h
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">Contato</h3>
            <ul className="flex flex-col gap-1.5 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                R. Silva Jardim, 21-31 — Jardim Vânia Maria, Bauru - SP
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0" />
                (14) 99617-8123
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Panela Cheia Supermercado. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
