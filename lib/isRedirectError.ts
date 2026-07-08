// O redirect() do Next.js (usado em Server Actions) funciona lançando um erro especial
// com esse "digest", que o próprio framework intercepta pra fazer a navegação. Quando a
// Server Action é chamada diretamente (fora de <form action={...}>), esse throw pode
// acabar caindo no nosso try/catch como se fosse um erro de verdade — sem isso, mostraríamos
// "NEXT_REDIRECT" pro usuário mesmo quando a ação deu certo.
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
