import { createClient } from "@/lib/supabase/server";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("sort_order");

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center text-neutral-500">
        <p>Não foi possível carregar o catálogo agora. Tente novamente em instantes.</p>
      </div>
    );
  }

  return <CatalogClient products={(data ?? []) as Product[]} />;
}
