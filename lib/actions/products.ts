"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

async function uploadImageIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData
): Promise<string | null> {
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  // Imagem escolhida na busca do Google Imagens: já foi baixada e salva no bucket (ver ProductForm).
  const chosenUrl = formData.get("chosen_image_url");
  if (typeof chosenUrl === "string" && chosenUrl.length > 0) return chosenUrl;

  return null;
}

function parseProductFields(formData: FormData) {
  const priceReais = parseFloat(String(formData.get("price")).replace(",", "."));
  const isPromo = formData.get("is_promo") === "on";

  const originalPriceRaw = String(formData.get("original_price") ?? "").trim();
  const originalPriceReais = originalPriceRaw ? parseFloat(originalPriceRaw.replace(",", ".")) : NaN;
  const original_price_cents =
    isPromo && !Number.isNaN(originalPriceReais) ? Math.round(originalPriceReais * 100) : null;

  return {
    name: String(formData.get("name")),
    price_cents: Math.round(priceReais * 100),
    original_price_cents,
    unit: String(formData.get("unit")),
    category_id: String(formData.get("category_id")),
    is_active: formData.get("is_active") === "on",
    is_promo: isPromo,
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await requireStaff();
  const fields = parseProductFields(formData);
  const imageUrl = await uploadImageIfPresent(supabase, formData);

  const { error } = await supabase.from("product").insert({
    ...fields,
    image_url: imageUrl,
  });
  if (error) throw new Error(`Não foi possível criar o produto: ${error.message}`);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await requireStaff();
  const fields = parseProductFields(formData);
  const imageUrl = await uploadImageIfPresent(supabase, formData);

  const { error } = await supabase
    .from("product")
    .update({
      ...fields,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Não foi possível atualizar o produto: ${error.message}`);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function deleteProduct(id: string) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("product").delete().eq("id", id);
  if (error) throw new Error(`Não foi possível excluir o produto: ${error.message}`);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function toggleProductField(
  id: string,
  field: "is_active" | "is_promo",
  value: boolean
) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("product").update({ [field]: value }).eq("id", id);
  if (error) throw new Error(`Não foi possível atualizar o produto: ${error.message}`);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
