"use client";

import type { CartItem, FulfillmentType } from "@/lib/types";
import { formatarCentavos, RETIRADA_FEE_CENTS } from "@/lib/orders/fees";

export function OrderSummary({
  items,
  subtotalCents,
  fulfillmentType,
}: {
  items: CartItem[];
  subtotalCents: number;
  fulfillmentType: FulfillmentType;
}) {
  const feeConhecida = fulfillmentType === "retirada" ? RETIRADA_FEE_CENTS : null;

  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-neutral-600">Resumo do pedido</h2>

      <ul className="mb-3 flex flex-col gap-1 text-sm">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>{formatarCentavos(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between border-t border-neutral-100 pt-2 text-sm">
        <span>Subtotal</span>
        <span>{formatarCentavos(subtotalCents)}</span>
      </div>

      <div className="flex justify-between pt-1 text-sm">
        <span>{fulfillmentType === "retirada" ? "Taxa de retirada" : "Taxa de entrega"}</span>
        <span>
          {feeConhecida !== null
            ? formatarCentavos(feeConhecida)
            : "calculada ao confirmar"}
        </span>
      </div>

      <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-base font-bold">
        <span>Total</span>
        <span>
          {feeConhecida !== null
            ? formatarCentavos(subtotalCents + feeConhecida)
            : `a partir de ${formatarCentavos(subtotalCents)}`}
        </span>
      </div>
    </div>
  );
}
