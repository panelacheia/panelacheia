"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { parseCsv, generateProductTemplateCsv } from "@/lib/csv";
import { bulkCreateProducts, type BulkImportResult } from "@/lib/actions/products";

export function BulkUploadModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleBaixarModelo() {
    const csv = generateProductTemplateCsv();
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-produtos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErro(null);
    setResultado(null);
    setEnviando(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) throw new Error("A planilha está vazia.");

      const result = await bulkCreateProducts(
        rows.map((r) => ({
          nome: r.nome ?? "",
          categoria: r.categoria ?? "",
          unidade: r.unidade ?? "",
          preco: r.preco ?? "",
          promocao: r.promocao ?? "",
          preco_antes: r.preco_antes ?? "",
          ativo: r.ativo ?? "",
        }))
      );
      setResultado(result);
      if (result.created > 0) router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao processar a planilha.");
    } finally {
      setEnviando(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    setOpen(false);
    setErro(null);
    setResultado(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"
      >
        <Upload size={16} />
        Upload em massa
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={handleClose}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Importar produtos via planilha</h3>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar"
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
              <p className="mb-2">
                Envie um arquivo <strong>.csv</strong> com as colunas: <code>nome</code>,{" "}
                <code>categoria</code>, <code>unidade</code> (un ou kg), <code>preco</code>,{" "}
                <code>promocao</code> (sim/nao), <code>preco_antes</code> (só se em promoção) e{" "}
                <code>ativo</code> (sim/nao).
              </p>
              <p className="mb-2">
                Se a <code>categoria</code> ainda não existir, ela é criada automaticamente.
              </p>
              <button
                type="button"
                onClick={handleBaixarModelo}
                className="inline-flex items-center gap-1.5 font-semibold text-brand-primary hover:underline"
              >
                <Download size={14} />
                Baixar modelo da planilha
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="bulk-product-upload"
                className={`cursor-pointer rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark ${
                  enviando ? "pointer-events-none opacity-60" : ""
                }`}
              >
                {enviando ? "Importando..." : "Selecionar arquivo .csv"}
              </label>
              <input
                ref={fileInputRef}
                id="bulk-product-upload"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleArquivo}
                disabled={enviando}
              />
            </div>

            {erro && <p className="text-sm text-brand-secondary">{erro}</p>}

            {resultado && (
              <div className="flex flex-col gap-2 text-sm">
                {resultado.created > 0 && (
                  <p className="flex items-center gap-2 font-medium text-green-700">
                    <CheckCircle2 size={16} />
                    {resultado.created} produto{resultado.created > 1 ? "s" : ""} criado
                    {resultado.created > 1 ? "s" : ""} com sucesso.
                  </p>
                )}
                {resultado.errors.length > 0 && (
                  <div>
                    <p className="mb-1 flex items-center gap-2 font-medium text-brand-secondary">
                      <AlertTriangle size={16} />
                      {resultado.errors.length} linha{resultado.errors.length > 1 ? "s" : ""} com
                      erro:
                    </p>
                    <ul className="flex flex-col gap-1 rounded-lg bg-red-50 p-3 text-xs text-brand-secondary">
                      {resultado.errors.map((e, i) => (
                        <li key={i}>
                          {e.row > 0 ? `Linha ${e.row}: ` : ""}
                          {e.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
