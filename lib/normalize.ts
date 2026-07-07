// Remove acentos e caixa para permitir busca tipo "acucar" encontrar "Açúcar".
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
