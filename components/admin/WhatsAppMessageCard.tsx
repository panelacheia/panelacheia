"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

export function WhatsAppMessageCard({ message }: { message: string }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-600">
        <MessageCircle size={16} className="text-green-600" />
        Mensagem enviada no WhatsApp
      </div>

      <div
        className={`overflow-hidden rounded-lg bg-[#dcf8c6] p-3 text-sm text-neutral-800 ${
          expandido ? "" : "max-h-24"
        }`}
      >
        <pre className="whitespace-pre-wrap font-sans">{message}</pre>
      </div>

      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
      >
        {expandido ? (
          <>
            <ChevronUp size={14} /> Recolher
          </>
        ) : (
          <>
            <ChevronDown size={14} /> Ver mensagem completa
          </>
        )}
      </button>
    </div>
  );
}
