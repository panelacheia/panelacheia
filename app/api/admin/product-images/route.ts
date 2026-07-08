import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase.storage.from("product-images").list("", {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const images = (data ?? [])
    .filter((f) => f.id)
    .map((f) => ({
      name: f.name,
      url: supabase.storage.from("product-images").getPublicUrl(f.name).data.publicUrl,
      sizeBytes: (f.metadata as { size?: number } | null)?.size ?? 0,
    }));

  return NextResponse.json({ images });
}
