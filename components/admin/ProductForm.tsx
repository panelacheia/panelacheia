"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ImageOff } from "lucide-react";
import type { Category, Product, StorageImage } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { isRedirectError } from "@/lib/isRedirectError";

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

  const [imagemEscolhida, setImagemEscolhida] = useState<string | null>(null);
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [arquivoPreview, setArquivoPreview] = useState<string | null>(null);
  const [fotoAtualComErro, setFotoAtualComErro] = useState(false);
  const [isPromo, setIsPromo] = useState(product?.is_promo ?? false);
  const [fotoAtualAmpliada, setFotoAtualAmpliada] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bibliotecaAberta, setBibliotecaAberta] = useState(false);
  const [carregandoBiblioteca, setCarregandoBiblioteca] = useState(false);
  const [imagensBiblioteca, setImagensBiblioteca] = useState<StorageImage[]>([]);
  const [imagensComErro, setImagensComErro] = useState<Record<string, boolean>>({});

  const fotoPreviewUrl = arquivoPreview ?? imagemEscolhida ?? product?.image_url ?? null;

  useEffect(() => {
    return () => {
      if (arquivoPreview) URL.revokeObjectURL(arquivoPreview);
    };
  }, [arquivoPreview]);

  async function handleAbrirBiblioteca() {
    setErro(null);
    setBibliotecaAberta(true);
    setCarregandoBiblioteca(true);
    try {
      const res = await fetch("/api/admin/product-images");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível carregar as imagens.");
      setImagensBiblioteca(data.images);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar as imagens.");
    } finally {
      setCarregandoBiblioteca(false);
    }
  }

  function handleEscolherDaBiblioteca(img: StorageImage) {
    setImagemEscolhida(img.url);
    setArquivoNome(null);
    if (arquivoPreview) URL.revokeObjectURL(arquivoPreview);
    setArquivoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFotoAtualComErro(false);
    setBibliotecaAberta(false);
  }

  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setArquivoNome(file?.name ?? null);
    if (arquivoPreview) URL.revokeObjectURL(arquivoPreview);
    setArquivoPreview(file ? URL.createObjectURL(file) : null);
    setFotoAtualComErro(false);
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
        setPendingFormData(null);
      } catch (e) {
        if (isRedirectError(e)) throw e; // navegação de sucesso, deixa o Next.js continuar
        setErro(e instanceof Error ? e.message : "Erro ao salvar produto.");
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

      <div className={`grid grid-cols-1 gap-3 ${isPromo ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
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
          <select
            name="unit"
            defaultValue={product?.unit === "kg" ? "kg" : "un"}
            required
            className={inputClass}
          >
            <option value="un">Unidade (un)</option>
            <option value="kg">Peso (kg)</option>
          </select>
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

        {fotoPreviewUrl && (
          <button
            type="button"
            onClick={() => !fotoAtualComErro && setFotoAtualAmpliada(true)}
            className="mb-2 block"
            aria-label="Ver foto ampliada"
          >
            {fotoAtualComErro ? (
              <div
                className="flex h-16 w-16 items-center justify-center rounded bg-neutral-100 text-neutral-400"
                title="Não foi possível carregar a imagem"
              >
                <ImageOff size={20} />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoPreviewUrl}
                alt=""
                onError={() => setFotoAtualComErro(true)}
                className="h-16 w-16 rounded object-cover ring-1 ring-neutral-200 transition hover:opacity-80"
              />
            )}
          </button>
        )}

        {fotoAtualAmpliada && fotoPreviewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setFotoAtualAmpliada(false)}
          >
            <div className="max-h-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotoPreviewUrl}
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

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAbrirBiblioteca}
            className="rounded-lg border border-brand-primary px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"
          >
            Escolher da biblioteca
          </button>
        </div>

        {bibliotecaAberta && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setBibliotecaAberta(false)}
          >
            <div
              className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-3 rounded-xl bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Escolher imagem já enviada</h3>
                <button
                  type="button"
                  onClick={() => setBibliotecaAberta(false)}
                  className="text-xs text-neutral-500 hover:underline"
                >
                  Fechar
                </button>
              </div>

              {carregandoBiblioteca ? (
                <p className="py-8 text-center text-sm text-neutral-500">Carregando...</p>
              ) : imagensBiblioteca.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">
                  Nenhuma imagem enviada ainda. Envie fotos na aba &quot;Imagens&quot;.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
                  {imagensBiblioteca.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => handleEscolherDaBiblioteca(img)}
                      disabled={imagensComErro[img.name]}
                      title={imagensComErro[img.name] ? "Erro ao carregar essa imagem" : img.name}
                      className="relative aspect-square overflow-hidden rounded border border-neutral-200 hover:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-neutral-200"
                    >
                      {imagensComErro[img.name] ? (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-50 text-neutral-300">
                          <ImageOff size={18} />
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt={img.name}
                          onError={() => setImagensComErro((prev) => ({ ...prev, [img.name]: true }))}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
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
          ref={fileInputRef}
          id="image-upload"
          name="image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleArquivoSelecionado}
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
        busyLabel="Salvando..."
        tone="primary"
        busy={isPending}
        onConfirm={confirmSave}
        onCancel={() => setPendingFormData(null)}
      />
    </form>
  );
}
