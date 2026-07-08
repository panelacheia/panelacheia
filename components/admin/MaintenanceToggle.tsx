"use client";

import { useState, useTransition } from "react";
import { Wrench } from "lucide-react";
import { setMaintenanceMode } from "@/lib/actions/settings";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function MaintenanceToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function apply(value: boolean) {
    setErro(null);
    startTransition(async () => {
      try {
        await setMaintenanceMode(value);
        setEnabled(value);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao atualizar.");
      } finally {
        setConfirmOpen(false);
      }
    });
  }

  return (
    <div className="rounded-lg bg-white/5 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-white/80">
          <Wrench size={15} className={enabled ? "text-brand-secondary" : "text-white/50"} />
          Modo manutenção
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Ativar ou desativar modo manutenção"
          disabled={isPending}
          onClick={() => (enabled ? apply(false) : setConfirmOpen(true))}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
            enabled ? "bg-brand-secondary" : "bg-white/20"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p className="mt-1 text-[11px] text-white/40">
        {enabled ? "Site bloqueado para clientes." : "Site funcionando normalmente."}
      </p>
      {erro && <p className="mt-1 text-[11px] text-red-300">{erro}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Ativar modo manutenção"
        message="Os clientes vão ver uma mensagem de manutenção e não vão conseguir fazer pedidos até você desativar de novo. Continuar?"
        confirmLabel="Ativar"
        busyLabel="Ativando..."
        tone="danger"
        busy={isPending}
        onConfirm={() => apply(true)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
