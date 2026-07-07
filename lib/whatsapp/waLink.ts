// Número de WhatsApp da loja para onde os pedidos são enviados (formato E.164, sem "+").
export const STORE_WHATSAPP_NUMBER = "5514996178123";

export function buildWaLink(message: string): string {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
