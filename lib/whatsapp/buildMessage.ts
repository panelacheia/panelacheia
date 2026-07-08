import { formatarCentavos } from "@/lib/orders/fees";
import { formatQuantidade } from "@/lib/orders/quantity";
import type { FulfillmentType, PaymentMethod } from "@/lib/types";

const NOMES_PAGAMENTO: Record<PaymentMethod, string> = {
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  pix: "Pix",
};

export type MessageItem = {
  productName: string;
  unit: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export function buildWhatsappMessage(params: {
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  items: MessageItem[];
  subtotalCents: number;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  deliveryDistanceKm?: number | null;
  geocodeFailed?: boolean;
  deliveryFeeCents: number;
  paymentMethod: PaymentMethod;
  totalCents: number;
}): string {
  const {
    orderNumber,
    customerName,
    customerPhone,
    items,
    subtotalCents,
    fulfillmentType,
    deliveryAddress,
    deliveryDistanceKm,
    geocodeFailed,
    deliveryFeeCents,
    paymentMethod,
    totalCents,
  } = params;

  const linhasItens = items
    .map((item) => {
      const qtd = formatQuantidade(item.quantity, item.unit);
      return `${qtd} ${item.productName} — ${formatarCentavos(
        item.unitPriceCents
      )}/${item.unit} = ${formatarCentavos(item.lineTotalCents)}`;
    })
    .join("\n");

  const blocoEntrega =
    fulfillmentType === "entrega"
      ? [
          `*Entrega* — ${deliveryAddress ?? ""}`,
          deliveryDistanceKm != null
            ? `*Distância aprox.:* ${deliveryDistanceKm.toFixed(1)} km`
            : null,
          geocodeFailed
            ? `_Não foi possível calcular a distância automaticamente — taxa máxima aplicada, loja pode ajustar._`
            : null,
          `*Taxa de entrega:* ${formatarCentavos(deliveryFeeCents)}`,
        ]
          .filter(Boolean)
          .join("\n")
      : ["*Retirada na loja*", `*Taxa de retirada:* ${formatarCentavos(deliveryFeeCents)}`].join(
          "\n"
        );

  return [
    `*NOVO PEDIDO #${orderNumber} - Panela Cheia*`,
    "",
    `*Cliente:* ${customerName}`,
    `*Telefone:* ${customerPhone}`,
    "",
    `*Itens:*`,
    linhasItens,
    "",
    `*Subtotal:* ${formatarCentavos(subtotalCents)}`,
    "",
    blocoEntrega,
    "",
    `*Forma de pagamento:* ${NOMES_PAGAMENTO[paymentMethod]}`,
    "",
    `*TOTAL: ${formatarCentavos(totalCents)}*`,
  ].join("\n");
}
