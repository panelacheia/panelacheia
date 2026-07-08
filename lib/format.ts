export function formatarPercentual(valor: number, casas = 1): string {
  return `${valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
}
