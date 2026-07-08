"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/cartStore";
import { PEDIDO_MINIMO_CENTS, formatarCentavos } from "@/lib/orders/fees";
import { FulfillmentToggle } from "@/components/checkout/FulfillmentToggle";
import { PaymentMethodSelect } from "@/components/checkout/PaymentMethodSelect";
import { AddressForm, type EnderecoEntrega } from "@/components/checkout/AddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import type { CreateOrderRequest, CreateOrderResponse, FulfillmentType, PaymentMethod } from "@/lib/types";

const ENDERECO_VAZIO: EnderecoEntrega = {
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  complement: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("retirada");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [endereco, setEndereco] = useState<EnderecoEntrega>(ENDERECO_VAZIO);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [entregaFeeCents, setEntregaFeeCents] = useState<number | null>(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);

  const enderecoParaFrete =
    fulfillmentType === "entrega" &&
    endereco.street &&
    endereco.number &&
    endereco.city &&
    endereco.state;

  useEffect(() => {
    if (!enderecoParaFrete) {
      setEntregaFeeCents(null);
      return;
    }

    setCalculandoFrete(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/delivery-fee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(endereco),
        });
        if (res.ok) {
          const data = (await res.json()) as { feeCents: number };
          setEntregaFeeCents(data.feeCents);
        }
      } finally {
        setCalculandoFrete(false);
      }
    }, 700);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enderecoParaFrete,
    endereco.street,
    endereco.number,
    endereco.neighborhood,
    endereco.city,
    endereco.state,
  ]);

  const enderecoCompleto =
    fulfillmentType === "retirada" ||
    (endereco.street && endereco.number && endereco.neighborhood && endereco.city && endereco.state);

  const atingiuMinimo = subtotalCents >= PEDIDO_MINIMO_CENTS;

  const podeEnviar =
    items.length > 0 &&
    atingiuMinimo &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    paymentMethod !== null &&
    enderecoCompleto &&
    !submitting;

  const camposFaltando: string[] = [];
  if (!atingiuMinimo) {
    camposFaltando.push(
      `Pedido mínimo de ${formatarCentavos(PEDIDO_MINIMO_CENTS)} (faltam ${formatarCentavos(
        PEDIDO_MINIMO_CENTS - subtotalCents
      )})`
    );
  }
  if (!customerName.trim()) camposFaltando.push("Seu nome");
  if (!customerPhone.trim()) camposFaltando.push("Telefone / WhatsApp");
  if (fulfillmentType === "entrega") {
    if (!endereco.street) camposFaltando.push("Rua");
    if (!endereco.number) camposFaltando.push("Número");
    if (!endereco.neighborhood) camposFaltando.push("Bairro");
    if (!endereco.city) camposFaltando.push("Cidade");
    if (!endereco.state) camposFaltando.push("UF");
  }
  if (!paymentMethod) camposFaltando.push("Forma de pagamento");

  async function handleSubmit() {
    if (!podeEnviar || !paymentMethod) return;
    setSubmitting(true);
    setErro(null);

    const payload: CreateOrderRequest = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      customerName,
      customerPhone,
      fulfillmentType,
      paymentMethod,
      delivery: fulfillmentType === "entrega" ? endereco : undefined,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível enviar o pedido. Tente novamente.");
        setSubmitting(false);
        return;
      }

      const data = (await res.json()) as CreateOrderResponse;

      window.sessionStorage.setItem(
        `pedido:${data.orderNumber}`,
        JSON.stringify(data)
      );

      clear();
      router.push(`/pedido/${data.orderNumber}/confirmacao`);
    } catch {
      setErro("Não foi possível enviar o pedido. Verifique sua conexão e tente novamente.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-neutral-600">Seu carrinho está vazio.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg bg-brand-primary px-4 py-2 font-semibold text-white">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Finalizar pedido</h1>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Seu nome</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Telefone / WhatsApp</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="(14) 90000-0000"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-600">Retirada ou entrega?</label>
          <FulfillmentToggle value={fulfillmentType} onChange={setFulfillmentType} />
        </div>

        {fulfillmentType === "entrega" && (
          <div>
            <label className="mb-2 block text-xs font-medium text-neutral-600">Endereço de entrega</label>
            <AddressForm value={endereco} onChange={setEndereco} />
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-600">Forma de pagamento</label>
          <PaymentMethodSelect value={paymentMethod} onChange={setPaymentMethod} />
        </div>

        <OrderSummary
          items={items}
          subtotalCents={subtotalCents}
          fulfillmentType={fulfillmentType}
          entregaFeeCents={entregaFeeCents}
          calculandoFrete={calculandoFrete}
        />

        {erro && <p className="text-sm text-brand-secondary">{erro}</p>}

        {!podeEnviar && !submitting && camposFaltando.length > 0 && (
          <p className="text-sm text-brand-secondary">
            Preencha para continuar: {camposFaltando.join(", ")}
          </p>
        )}

        <button
          type="button"
          disabled={!podeEnviar}
          onClick={handleSubmit}
          className="rounded-xl bg-brand-primary px-4 py-3 font-semibold text-white hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {submitting ? "Enviando pedido..." : "Fazer Pedido"}
        </button>
      </div>
    </div>
  );
}
