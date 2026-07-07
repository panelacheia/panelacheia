"use client";

import { useState, useTransition } from "react";
import type { Category } from "@/lib/types";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function CategoriesPageClient({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editandoNome, setEditandoNome] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleCreate(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      try {
        await createCategory(formData);
        setNovoNome("");
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao criar categoria.");
      }
    });
  }

  function handleUpdate(id: string) {
    setErro(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("name", editandoNome);
        await updateCategory(id, formData);
        setEditandoId(null);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao atualizar categoria.");
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setErro(null);
    startTransition(async () => {
      try {
        await deleteCategory(deleteTarget.id);
        setDeleteTarget(null);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao excluir categoria.");
      }
    });
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <form action={handleCreate} className="flex gap-2">
        <input
          name="name"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          required
          placeholder="Nova categoria (ex: Padaria)"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="whitespace-nowrap rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-60"
        >
          + Adicionar
        </button>
      </form>

      {erro && <p className="text-sm text-brand-secondary">{erro}</p>}

      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-2 px-3 py-2">
              {editandoId === c.id ? (
                <>
                  <input
                    value={editandoNome}
                    onChange={(e) => setEditandoNome(e.target.value)}
                    autoFocus
                    className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(c.id)}
                    disabled={isPending}
                    className="text-sm font-medium text-brand-primary hover:underline disabled:opacity-60"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoId(null)}
                    className="text-sm text-neutral-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoId(c.id);
                      setEditandoNome(c.name);
                    }}
                    className="text-sm font-medium text-brand-primary hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: c.id, name: c.name })}
                    disabled={isPending}
                    className="text-sm font-medium text-brand-secondary hover:underline disabled:opacity-60"
                  >
                    Excluir
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir categoria"
        message={`Excluir a categoria "${deleteTarget?.name}"?`}
        busy={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
