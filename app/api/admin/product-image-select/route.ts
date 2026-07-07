import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { imageUrl } = (await req.json()) as { imageUrl?: string };
  if (!imageUrl) {
    return NextResponse.json({ error: "Nenhuma imagem selecionada." }, { status: 400 });
  }

  let imageRes: Response;
  try {
    imageRes = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PanelaCheiaBot/1.0)" },
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível baixar essa imagem. Tente outra opção." },
      { status: 502 }
    );
  }
  if (!imageRes.ok) {
    return NextResponse.json(
      { error: "Não foi possível baixar essa imagem. Tente outra opção." },
      { status: 502 }
    );
  }

  const contentType = imageRes.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  const ext = EXT_BY_CONTENT_TYPE[contentType] ?? "jpg";
  const imageBlob = await imageRes.blob();

  const path = `google-${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, imageBlob, { contentType, cacheControl: "3600" });
  if (uploadError) {
    return NextResponse.json({ error: `Falha ao salvar imagem: ${uploadError.message}` }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ url: publicUrlData.publicUrl });
}
