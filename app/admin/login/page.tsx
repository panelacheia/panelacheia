"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      setCarregando(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0b1f45] px-4">
      {/* Efeitos de fundo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-primary/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-secondary/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-xl">
            <Image
              src="/logos/panelacheia.png"
              alt="Panela Cheia"
              width={1600}
              height={828}
              priority
              className="h-14 w-auto"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h1 className="text-center text-xl font-bold text-neutral-800">Painel Administrativo</h1>
          <p className="mb-6 text-center text-sm text-neutral-500">Faça login para continuar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-3 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="password"
                required
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-3 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            {erro && <p className="text-sm text-brand-secondary">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="mt-2 rounded-lg bg-brand-primary px-4 py-2.5 font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">Panela Cheia Supermercado</p>
      </div>
    </div>
  );
}
