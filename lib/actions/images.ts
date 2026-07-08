"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { removeBackground } from "@/lib/images/removeBackground";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function uploadImages(formData: FormData) {
  const supabase = await requireStaff();
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!files.length) throw new Error("Nenhum arquivo selecionado.");

  for (const file of files) {
    const original = Buffer.from(await file.arrayBuffer());
    const processed = await removeBackground(original);
    const semFundo = processed !== original;

    const path = `upload-${crypto.randomUUID()}.${semFundo ? "png" : (file.name.split(".").pop() ?? "jpg")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, processed, {
      cacheControl: "3600",
      upsert: false,
      contentType: semFundo ? "image/png" : file.type || "image/jpeg",
    });
    if (error) throw new Error(`Falha ao enviar "${file.name}": ${error.message}`);
  }

  revalidatePath("/admin/imagens");
}

export async function deleteImage(path: string) {
  const supabase = await requireStaff();
  const { error } = await supabase.storage.from("product-images").remove([path]);
  if (error) throw new Error(`Não foi possível excluir a imagem: ${error.message}`);

  revalidatePath("/admin/imagens");
}
