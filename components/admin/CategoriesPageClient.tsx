"use client";

import { useState, useTransition } from "react";
import { Tag, Pencil, Trash2, Check, X, Plus } from "lucide-react";
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
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
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
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-60"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </form>
      </div>

      {erro && <p className="text-sm text-brand-secondary">{erro}</p>}

      {categories.length === 0 ? (
        <p className="text-center text-sm text-neutral-500">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              {editandoId === c.id ? (
                <>
                  <Tag size={16} className="shrink-0 text-neutral-300" />
                  <input
                    value={editandoNome}
                    onChange={(e) => setEditandoNome(e.target.value)}
                    autoFocus
                    className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(c.id)}
                    disabled={isPending}
                    aria-label="Salvar"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-primary hover:bg-brand-primary/10 disabled:opacity-60"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoId(null)}
                    aria-label="Cancelar"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Tag size={16} className="shrink-0 text-brand-primary" />
                  <span className="flex-1 text-sm">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoId(c.id);
                      setEditandoNome(c.name);
                    }}
                    aria-label={`Editar ${c.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-primary hover:bg-brand-primary/10"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: c.id, name: c.name })}
                    disabled={isPending}
                    aria-label={`Excluir ${c.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-secondary hover:bg-brand-secondary/10 disabled:opacity-60"
                  >
                    <Trash2 size={16} />
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
