/**
 * Formata um telefone brasileiro conforme o usuário digita: só números,
 * no máximo 11 dígitos (DDD + celular). Com 10 dígitos ou menos ajusta pro
 * formato de fixo (xx) xxxx-xxxx; com 11 ajusta pro formato de celular
 * (xx) xxxxx-xxxx.
 */
export function formatPhoneBR(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, "").slice(0, 11);
  const len = digits.length;

  if (len === 0) return "";
  if (len <= 2) return `(${digits}`;
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
