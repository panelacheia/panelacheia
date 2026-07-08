"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Trash2, ImageOff, Copy, Check } from "lucide-react";
import type { StorageImage } from "@/lib/types";
import { uploadImages, deleteImage } from "@/lib/actions/images";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const LIMITE_ARMAZENAMENTO_BYTES = 1024 * 1024 * 1024; // 1 GB — plano gratuito do Supabase

function formatarBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2).replace(".", ",")} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function ImagesPageClient({ images }: { images: StorageImage[] }) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StorageImage | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [comErro, setComErro] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imagensFiltradas = images.filter((img) =>
    img.name.toLowerCase().includes(busca.toLowerCase())
  );

  const bytesUsados = images.reduce((soma, img) => soma + img.sizeBytes, 0);
  const percentualUsado = Math.min(100, (bytesUsados / LIMITE_ARMAZENAMENTO_BYTES) * 100);
  const pertoDoLimite = percentualUsado >= 80;

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErro(null);
    setEnviando(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("images", f));

    startTransition(async () => {
      try {
        await uploadImages(formData);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao enviar imagens.");
      } finally {
        setEnviando(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setErro(null);
    startTransition(async () => {
      try {
        await deleteImage(deleteTarget.name);
        setDeleteTarget(null);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao excluir imagem.");
      }
    });
  }

  async function handleCopyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(url);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      // clipboard indisponível, ignora
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-lg font-bold">Imagens</h1>
          <p className="text-sm text-neutral-500">
            Todas as fotos já enviadas para o banco de dados. {images.length} no total.
          </p>
        </div>

        <div className="flex w-full flex-col gap-1 sm:max-w-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Armazenamento</span>
            <span className={pertoDoLimite ? "font-semibold text-brand-secondary" : ""}>
              {formatarBytes(bytesUsados)} de {formatarBytes(LIMITE_ARMAZENAMENTO_BYTES)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full transition-all ${
                pertoDoLimite ? "bg-brand-secondary" : "bg-brand-primary"
              }`}
              style={{ width: `${percentualUsado}%` }}
            />
          </div>
          {pertoDoLimite && (
            <p className="text-[11px] text-brand-secondary">
              Chegando perto do limite do plano gratuito.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            id="bulk-image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
            disabled={enviando}
          />
          <label
            htmlFor="bulk-image-upload"
            className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark ${
              enviando ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <Upload size={16} />
            {enviando ? "Enviando..." : "Enviar imagens"}
          </label>
        </div>
      </div>

      {erro && <p className="text-sm text-brand-secondary">{erro}</p>}

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome do arquivo..."
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none sm:max-w-xs"
      />

      {imagensFiltradas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-neutral-400">
          <ImageOff size={32} />
          <p className="text-sm">
            {images.length === 0 ? "Nenhuma imagem enviada ainda." : "Nenhuma imagem encontrada."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {imagensFiltradas.map((img) => (
            <div
              key={img.name}
              className="group relative overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm"
            >
              <div className="relative aspect-square bg-neutral-100">
                {comErro[img.name] ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-300">
                    <ImageOff size={24} />
                    <span className="text-[10px] font-medium text-neutral-400">Erro ao carregar</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.name}
                    onError={() => setComErro((prev) => ({ ...prev, [img.name]: true }))}
                    className="absolute inset-0 h-full w-full object-contain p-2"
                  />
                )}
              </div>
              <p className="truncate px-2 py-1.5 text-[11px] text-neutral-500" title={img.name}>
                {img.name}
              </p>

              <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleCopyLink(img.url)}
                  aria-label="Copiar link da imagem"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-neutral-600 shadow hover:bg-white"
                >
                  {copiado === img.url ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(img)}
                  aria-label={`Excluir ${img.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-brand-secondary shadow hover:bg-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir imagem"
        message={`Excluir "${deleteTarget?.name}"? Produtos que usam essa foto ficarão sem imagem.`}
        busyLabel="Excluindo..."
        busy={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
