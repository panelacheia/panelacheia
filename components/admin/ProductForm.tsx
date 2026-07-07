"use client";

import { useState, useTransition } from "react";
import type { Category, Product } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type ImageResult = { original: string; thumbnail: string; title: string };

export function ProductForm({
  product,
  categories,
  action,
}: {
  product?: Product;
  categories: Category[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [nome, setNome] = useState(product?.name ?? "");

  const [resultados, setResultados] = useState<ImageResult[]>([]);
  const [buscandoFotos, setBuscandoFotos] = useState(false);
  const [selecionando, setSelecionando] = useState<string | null>(null);
  const [imagemEscolhida, setImagemEscolhida] = useState<string | null>(null);
  const [originalEscolhido, setOriginalEscolhido] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImageResult | null>(null);
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [isPromo, setIsPromo] = useState(product?.is_promo ?? false);
  const [fotoAtualAmpliada, setFotoAtualAmpliada] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  async function handleBuscarFotos() {
    if (!nome.trim()) {
      setErro("Digite o nome do produto antes de buscar fotos.");
      return;
    }
    setErro(null);
    setResultados([]);
    setBuscandoFotos(true);
    try {
      const res = await fetch("/api/admin/product-image-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível buscar fotos.");
      setResultados(data.results);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível buscar fotos.");
    } finally {
      setBuscandoFotos(false);
    }
  }

  async function handleEscolherFoto(original: string) {
    setErro(null);
    setSelecionando(original);
    try {
      const res = await fetch("/api/admin/product-image-select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: original }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível salvar essa imagem.");
      setImagemEscolhida(data.url);
      setOriginalEscolhido(original);
      setPreview(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar essa imagem.");
    } finally {
      setSelecionando(null);
    }
  }

  function handleSubmit(formData: FormData) {
    setErro(null);
    setPendingFormData(formData);
  }

  function confirmSave() {
    if (!pendingFormData) return;
    startTransition(async () => {
      try {
        await action(pendingFormData);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao salvar produto.");
      } finally {
        setPendingFormData(null);
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none";

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Nome</label>
        <input
          name="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className={`grid gap-3 ${isPromo ? "grid-cols-3" : "grid-cols-2"}`}>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Preço (R$)</label>
          <input
            name="price"
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            required
            inputMode="decimal"
            placeholder="0,00"
            className={inputClass}
          />
        </div>

        {isPromo && (
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              Preço antes (R$)
            </label>
            <input
              name="original_price"
              defaultValue={
                product?.original_price_cents ? (product.original_price_cents / 100).toFixed(2) : ""
              }
              required
              inputMode="decimal"
              placeholder="0,00"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Unidade</label>
          <input
            name="unit"
            defaultValue={product?.unit}
            required
            placeholder="kg, un, pacote 500g..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Categoria</label>
        <select
          name="category_id"
          defaultValue={product?.category_id ?? ""}
          required
          className={inputClass}
        >
          <option value="" disabled>
            Selecione uma categoria
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Foto do produto {product?.image_url && "(deixe em branco para manter a atual)"}
        </label>

        {(imagemEscolhida ?? product?.image_url) && (
          <button
            type="button"
            onClick={() => setFotoAtualAmpliada(true)}
            className="mb-2 block"
            aria-label="Ver foto ampliada"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagemEscolhida ?? product?.image_url ?? ""}
              alt=""
              className="h-16 w-16 rounded object-cover ring-1 ring-neutral-200 transition hover:opacity-80"
            />
          </button>
        )}

        {fotoAtualAmpliada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setFotoAtualAmpliada(false)}
          >
            <div className="max-h-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagemEscolhida ?? product?.image_url ?? ""}
                alt=""
                className="max-h-[80vh] w-full rounded-xl bg-white object-contain"
              />
              <button
                type="button"
                onClick={() => setFotoAtualAmpliada(false)}
                className="mt-3 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleBuscarFotos}
            disabled={buscandoFotos}
            className="rounded-lg border border-brand-primary px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-60"
          >
            {buscandoFotos ? "Buscando..." : "Buscar fotos no Google"}
          </button>
        </div>

        {resultados.length > 0 && (
          <div className="mb-2">
            <div className="grid grid-cols-4 gap-2 rounded-lg border border-neutral-200 p-2 sm:grid-cols-6">
              {resultados.map((r) => (
                <button
                  key={r.original}
                  type="button"
                  onClick={() => setPreview(r)}
                  disabled={selecionando !== null}
                  title={r.title}
                  className={`relative aspect-square overflow-hidden rounded border hover:border-brand-primary disabled:opacity-50 ${
                    originalEscolhido === r.original ? "border-2 border-brand-primary" : "border-neutral-200"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.thumbnail} alt={r.title} className="h-full w-full object-cover" />
                  {selecionando === r.original && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white">
                      Salvando...
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setResultados([])}
              className="mt-1 text-xs text-neutral-500 hover:underline"
            >
              Ocultar resultados
            </button>
          </div>
        )}

        {preview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setPreview(null)}
          >
            <div
              className="flex max-h-full max-w-lg flex-col gap-3 rounded-xl bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.original}
                alt={preview.title}
                className="max-h-[60vh] w-full rounded-lg object-contain"
              />
              {preview.title && <p className="text-xs text-neutral-500">{preview.title}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => handleEscolherFoto(preview.original)}
                  disabled={selecionando !== null}
                  className="rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-60"
                >
                  {selecionando === preview.original ? "Salvando..." : "Usar esta imagem"}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mb-1 mt-2 text-xs font-medium text-neutral-600">
          Ou envie uma foto do seu computador (sobrepõe a escolhida acima):
        </p>
        <div className="flex items-center gap-2">
          <label
            htmlFor="image-upload"
            className="cursor-pointer rounded-lg border border-brand-primary px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"
          >
            Enviar foto do computador
          </label>
          {arquivoNome && <span className="text-xs text-neutral-500">{arquivoNome}</span>}
        </div>
        <input
          id="image-upload"
          name="image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setArquivoNome(e.target.files?.[0]?.name ?? null)}
        />
        <input type="hidden" name="chosen_image_url" value={imagemEscolhida ?? ""} />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
          Ativo (visível no catálogo)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_promo"
            checked={isPromo}
            onChange={(e) => setIsPromo(e.target.checked)}
          />
          Promoção
        </label>
      </div>

      {erro && <p className="text-sm text-brand-secondary">{erro}</p>}

      <button
        type="submit"
        disabled={isPending || pendingFormData !== null}
        className="mt-2 rounded-lg bg-brand-primary px-4 py-2 font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>

      <ConfirmDialog
        open={pendingFormData !== null}
        title={product ? "Salvar alterações" : "Criar produto"}
        message={
          product
            ? "Deseja salvar as alterações desse produto?"
            : "Deseja criar esse produto?"
        }
        confirmLabel="Salvar"
        busy={isPending}
        onConfirm={confirmSave}
        onCancel={() => setPendingFormData(null)}
      />
    </form>
  );
}
