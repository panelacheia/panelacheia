export type Category = {
  id: string;
  name: string;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  price_cents: number;
  original_price_cents: number | null;
  unit: string;
  image_url: string | null;
  category_id: string;
  category_name: string;
  is_active: boolean;
  is_promo: boolean;
  sort_order: number;
};

export type FulfillmentType = "retirada" | "entrega";
export type PaymentMethod = "cartao" | "dinheiro" | "pix";
export type PaymentStatus = "pendente" | "pago" | "nao_pago";

export type CartItem = {
  productId: string;
  name: string;
  unit: string;
  unitPriceCents: number;
  quantity: number;
};

export type GeocodeStatus = "n/a" | "ok" | "failed" | "manual";

export type CreateOrderRequest = {
  items: { productId: string; quantity: number }[];
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  delivery?: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  };
};

export type CreateOrderResponse = {
  orderNumber: number;
  whatsappUrl: string;
  totalCents: number;
};
