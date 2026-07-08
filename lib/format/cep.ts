/** Formata um CEP conforme o usuário digita: só números, no máximo 8 dígitos, no formato xxxxx-xxx. */
export function formatCepBR(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
