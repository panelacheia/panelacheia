export const RETIRADA_FEE_CENTS = 400;
export const ENTREGA_FEE_PERTO_CENTS = 800;
export const ENTREGA_FEE_LONGE_CENTS = 1600;
export const ENTREGA_DISTANCIA_LIMITE_KM = 3;

export function calcularTaxaEntrega(distanciaKmAjustada: number): number {
  return distanciaKmAjustada <= ENTREGA_DISTANCIA_LIMITE_KM
    ? ENTREGA_FEE_PERTO_CENTS
    : ENTREGA_FEE_LONGE_CENTS;
}

export function formatarCentavos(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
