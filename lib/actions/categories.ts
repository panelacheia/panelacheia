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

export async function createCategory(formData: FormData) {
  const supabase = await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Informe o nome da categoria.");

  const { error } = await supabase.from("category").insert({ name });
  if (error) {
    if (error.code === "23505") throw new Error("Já existe uma categoria com esse nome.");
    throw new Error(`Não foi possível criar a categoria: ${error.message}`);
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Informe o nome da categoria.");

  const { error } = await supabase.from("category").update({ name }).eq("id", id);
  if (error) {
    if (error.code === "23505") throw new Error("Já existe uma categoria com esse nome.");
    throw new Error(`Não foi possível atualizar a categoria: ${error.message}`);
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("category").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error("Essa categoria está em uso por produtos e não pode ser excluída.");
    }
    throw new Error(`Não foi possível excluir a categoria: ${error.message}`);
  }

  revalidatePath("/admin/categorias");
}
