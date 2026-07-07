import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

// Pexels indexa fotos majoritariamente com tags em inglês e favorece prato pronto/still life.
// Um modificador em inglês por categoria aproxima o resultado de uma foto "de produto" (ingrediente cru).
const CATEGORY_MODIFIERS: { match: RegExp; modifier: string }[] = [
  { match: /açoug|carne|boi|bovin|suín|porco|frango|aves|peixe|frutos do mar/i, modifier: "raw meat cut" },
  { match: /hortifruti|fruta|verdura|legum/i, modifier: "fresh produce" },
  { match: /padaria|pão|confeitaria/i, modifier: "bakery" },
  { match: /laticín|queijo|leite/i, modifier: "dairy product" },
];

function buildSearchQuery(name: string, category?: string) {
  const modifier = CATEGORY_MODIFIERS.find((c) => category && c.match.test(category))?.modifier;
  return modifier ? `${name} ${modifier}` : name;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { name, category } = (await req.json()) as { name?: string; category?: string };
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return NextResponse.json({ error: "Informe o nome do produto." }, { status: 400 });
  }

  // Reaproveita a imagem se outro produto com o mesmo nome já tiver uma.
  const { data: existing } = await supabase
    .from("product")
    .select("image_url")
    .ilike("name", trimmedName)
    .not("image_url", "is", null)
    .limit(1)
    .maybeSingle();

  if (existing?.image_url) {
    return NextResponse.json({ url: existing.image_url, source: "cache" });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Busca automática não configurada (PEXELS_API_KEY ausente)." },
      { status: 501 }
    );
  }

  const searchQuery = buildSearchQuery(trimmedName, category);
  const searchUrl = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=square`;
  const searchRes = await fetch(searchUrl, { headers: { Authorization: apiKey } });
  if (!searchRes.ok) {
    return NextResponse.json({ error: "Falha ao buscar imagem." }, { status: 502 });
  }

  const searchData = (await searchRes.json()) as {
    photos: { src: { large: string } }[];
  };
  const photo = searchData.photos?.[0];
  if (!photo) {
    return NextResponse.json({ error: "Nenhuma imagem encontrada para esse nome." }, { status: 404 });
  }

  const imageRes = await fetch(photo.src.large);
  if (!imageRes.ok) {
    return NextResponse.json({ error: "Falha ao baixar imagem encontrada." }, { status: 502 });
  }
  const imageBlob = await imageRes.blob();

  const path = `auto-${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, imageBlob, { contentType: "image/jpeg", cacheControl: "3600" });
  if (uploadError) {
    return NextResponse.json({ error: `Falha ao salvar imagem: ${uploadError.message}` }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ url: publicUrlData.publicUrl, source: "pexels" });
}
