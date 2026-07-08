// O banco guarda created_at em UTC, mas a loja opera no horário de Brasília
// (America/Sao_Paulo, UTC-3 fixo — sem horário de verão desde 2019). Sem esse ajuste,
// pedidos feitos perto da meia-noite (horário local) caem no dia errado nos filtros
// e nos gráficos por dia.
const TIMEZONE = "America/Sao_Paulo";

// "en-CA" formata como AAAA-MM-DD, que é o formato que já usamos nos filtros/inputs de data.
export function toBrazilDateISO(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

export function todayBrazilISO(): string {
  return toBrazilDateISO(new Date());
}

// Início/fim de um dia (AAAA-MM-DD) no horário de Brasília, pra usar em filtros
// de "created_at" (timestamptz) no Postgres.
export function brazilDayStartISO(dateISO: string): string {
  return `${dateISO}T00:00:00-03:00`;
}

export function brazilDayEndISO(dateISO: string): string {
  return `${dateISO}T23:59:59-03:00`;
}
