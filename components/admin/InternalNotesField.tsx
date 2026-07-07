"use client";

import { useState, useTransition } from "react";
import { updateInternalNotes } from "@/lib/actions/orders";

export function InternalNotesField({ id, initialNotes }: { id: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateInternalNotes(id, notes);
      setSavedNotes(notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-semibold text-neutral-600">Observações internas</h2>
      <p className="mb-2 text-xs text-neutral-400">Visível só aqui no admin — não vai pro cliente.</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Ex: cliente pediu pra trocar item, entregar após às 18h..."
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || notes === savedNotes}
          className="rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar observação"}
        </button>
        {saved && <span className="text-sm text-green-600">Salvo ✓</span>}
      </div>
    </div>
  );
}
