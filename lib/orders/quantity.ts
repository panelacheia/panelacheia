// Formata a quantidade de um item pro cliente/loja ler: "1kg 500g" pra produtos
// vendidos por peso, "2x" pra produtos vendidos por unidade.
export function formatQuantidade(quantity: number, unit: string): string {
  if (unit === "kg") {
    const kg = Math.floor(quantity);
    const g = Math.round((quantity - kg) * 1000);
    if (kg > 0 && g > 0) return `${kg}kg ${g}g`;
    if (kg > 0) return `${kg}kg`;
    return `${g}g`;
  }
  return `${quantity}x`;
}
