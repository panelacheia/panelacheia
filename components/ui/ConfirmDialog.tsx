"use client";

import { createPortal } from "react-dom";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Excluir",
  busyLabel,
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busyLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const toneClass =
    tone === "danger"
      ? "bg-brand-secondary hover:opacity-90"
      : "bg-brand-primary hover:bg-brand-primary-dark";

  // Portal pro <body>: renderizar dentro da árvore normal pode cair sob um ancestral
  // com CSS transform (ex: a sidebar do admin), o que quebra o `fixed` e prende o modal
  // dentro da caixa do ancestral em vez de cobrir a tela toda.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-base font-semibold text-neutral-900">{title}</h2>
        <p className="mb-5 text-sm text-neutral-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${toneClass}`}
          >
            {busy ? (busyLabel ?? `${confirmLabel}...`) : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
