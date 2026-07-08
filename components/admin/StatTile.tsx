type Tone = "primary" | "good" | "warning" | "critical";

// Mesmas cores da PaymentStatusSelect (pago/pendente/cancelado), pra bater com
// o resto do admin em vez de inventar uma paleta nova só pro dashboard.
const TONE_CLASSES: Record<Tone, string> = {
  primary: "text-brand-primary-dark",
  good: "text-green-700",
  warning: "text-yellow-700",
  critical: "text-brand-secondary",
};

export function StatTile({
  label,
  value,
  secondary,
  tone = "primary",
}: {
  label: string;
  value: string;
  secondary?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <p className="text-xs font-semibold text-neutral-600">{label}</p>
      <p className={`mt-0.5 text-2xl font-bold ${TONE_CLASSES[tone]}`}>{value}</p>
      {secondary && <p className="mt-0.5 text-xs font-medium text-neutral-500">{secondary}</p>}
    </div>
  );
}
