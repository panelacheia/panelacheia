// Horário de funcionamento da loja, usado para bloquear "Fazer Pedido" fora do expediente.
// 0 = domingo ... 6 = sábado (Date.getDay()).
const HORARIOS: Record<number, { abre: number; fecha: number } | null> = {
  0: { abre: 8, fecha: 13 }, // domingo
  1: { abre: 8, fecha: 20 }, // segunda
  2: { abre: 8, fecha: 20 }, // terça
  3: { abre: 8, fecha: 20 }, // quarta
  4: { abre: 8, fecha: 20 }, // quinta
  5: { abre: 8, fecha: 20 }, // sexta
  6: { abre: 8, fecha: 20 }, // sábado
};

export function lojaEstaAberta(agora: Date = new Date()): boolean {
  const horarioHoje = HORARIOS[agora.getDay()];
  if (!horarioHoje) return false;

  const horaAtual = agora.getHours() + agora.getMinutes() / 60;
  return horaAtual >= horarioHoje.abre && horaAtual < horarioHoje.fecha;
}

export function proximoHorarioTexto(agora: Date = new Date()): string {
  const dias = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ];

  for (let i = 0; i < 8; i++) {
    const dia = new Date(agora);
    dia.setDate(agora.getDate() + i);
    const horario = HORARIOS[dia.getDay()];
    if (!horario) continue;

    if (i === 0 && agora.getHours() < horario.abre) {
      return `hoje às ${horario.abre}h`;
    }
    if (i > 0) {
      return `${dias[dia.getDay()]} às ${horario.abre}h`;
    }
  }
  return "em breve";
}
