"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { formatarCentavos } from "@/lib/orders/fees";
import type { CreateOrderResponse } from "@/lib/types";

export default function ConfirmacaoPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const [pedido, setPedido] = useState<CreateOrderResponse | null | undefined>(undefined);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(`pedido:${orderNumber}`);
    // Hidratação intencional a partir do sessionStorage (só existe no browser, após o mount)
    // para não gerar mismatch entre o HTML renderizado no servidor e o do cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPedido(raw ? (JSON.parse(raw) as CreateOrderResponse) : null);
  }, [orderNumber]);

  if (pedido === undefined) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-5xl">✅</p>
      <h1 className="mt-4 text-xl font-bold">Pedido #{orderNumber} recebido!</h1>

      {pedido ? (
        <p className="mt-2 text-neutral-600">
          Total: <strong>{formatarCentavos(pedido.totalCents)}</strong>
        </p>
      ) : (
        <p className="mt-2 text-neutral-600">
          Não encontramos os detalhes aqui (talvez a página tenha sido recarregada), mas seu
          pedido já foi registrado.
        </p>
      )}

      <p className="mt-4 text-sm text-neutral-500">
        Se o WhatsApp não abriu automaticamente, toque no botão abaixo para enviar seu pedido.
      </p>

      {pedido && (
        <a
          href={pedido.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-xl bg-brand-green px-5 py-3 font-semibold text-white hover:bg-brand-green-dark"
        >
          Enviar pedido no WhatsApp
        </a>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-neutral-500 underline">
          Voltar para o catálogo
        </Link>
      </div>
    </div>
  );
}
