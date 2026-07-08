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

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// Meio-dia UTC do dia (já calculado no fuso de Brasília) nunca cruza a virada de data,
// então dá pra usar getUTCDay() sem se preocupar com o fuso do runtime.
export function brazilWeekdayLabel(date: Date): string {
  const dateISO = toBrazilDateISO(date);
  const weekdayIndex = new Date(`${dateISO}T12:00:00Z`).getUTCDay();
  return WEEKDAY_LABELS[weekdayIndex];
}
