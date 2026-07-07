import { createClient } from "@/lib/supabase/server";
import { CategoriesPageClient } from "@/components/admin/CategoriesPageClient";
import type { Category } from "@/lib/types";

export const revalidate = 0;

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("category").select("*").order("name");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Categorias</h1>
      <CategoriesPageClient categories={(data ?? []) as Category[]} />
    </div>
  );
}
