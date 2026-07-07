import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { name } = (await req.json()) as { name?: string };
  const query = name?.trim();
  if (!query) {
    return NextResponse.json({ error: "Informe o nome do produto." }, { status: 400 });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Busca de imagem não configurada (SERPAPI_KEY ausente)." },
      { status: 501 }
    );
  }

  const searchUrl =
    "https://serpapi.com/search.json?" +
    new URLSearchParams({
      engine: "google_images",
      q: query,
      gl: "br",
      hl: "pt-br",
      api_key: apiKey,
    });

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    return NextResponse.json({ error: "Falha ao buscar imagens." }, { status: 502 });
  }

  const searchData = (await searchRes.json()) as {
    images_results?: { original: string; thumbnail: string; title?: string }[];
  };

  const results = (searchData.images_results ?? []).slice(0, 12).map((r) => ({
    original: r.original,
    thumbnail: r.thumbnail,
    title: r.title ?? "",
  }));

  if (!results.length) {
    return NextResponse.json({ error: "Nenhuma imagem encontrada para esse nome." }, { status: 404 });
  }

  return NextResponse.json({ results });
}
