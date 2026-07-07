export type GeocodeResult = { lat: number; lng: number } | null;

// Geocodifica um endereço completo via Nominatim (OpenStreetMap, gratuito).
// Retorna null se não encontrar nada ou se a consulta falhar — quem chama decide o fallback.
export async function geocodeEndereco(enderecoCompleto: string): Promise<GeocodeResult> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", enderecoCompleto);
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim exige um User-Agent identificável (política de uso do serviço gratuito).
        "User-Agent": "PanelaCheiaPedidos/1.0 (contato via WhatsApp da loja)",
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}
