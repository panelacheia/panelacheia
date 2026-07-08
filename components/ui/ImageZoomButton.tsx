"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function ImageZoomButton({
  src,
  alt,
  thumbnailClassName,
}: {
  src: string;
  alt: string;
  thumbnailClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState(false);

  if (erro) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 text-neutral-400 ${thumbnailClassName}`}
        title="Não foi possível carregar a imagem"
      >
        <ImageOff size={16} />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `Ver foto ampliada de ${alt}` : "Ver foto ampliada"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} onError={() => setErro(true)} className={thumbnailClassName} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="max-h-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-full rounded-xl bg-white object-contain"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
