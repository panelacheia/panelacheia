export type ViaCepResult = {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
} | null;

// Consulta o ViaCEP (gratuito) para autopreencher rua/bairro/cidade a partir do CEP.
// Chamado direto do client (API pública com CORS liberado) — sem necessidade de proxy.
export async function buscarCep(cep: string): Promise<ViaCepResult> {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.erro) return null;

    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
    };
  } catch {
    return null;
  }
}
