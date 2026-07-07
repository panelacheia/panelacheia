import { createClient } from "@/lib/supabase/server";
import { CategoriesPageClient } from "@/components/admin/CategoriesPageClient";
import type { Category } from "@/lib/types";

export const revalidate = 0;

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("category").select("*").order("name");

  return <CategoriesPageClient categories={(data ?? []) as Category[]} />;
}
