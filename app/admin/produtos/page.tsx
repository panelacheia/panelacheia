import { createClient } from "@/lib/supabase/server";
import { ProductsPageClient } from "@/components/admin/ProductsPageClient";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function AdminProdutosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product")
    .select("*")
    .order("category")
    .order("sort_order");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Produtos</h1>
      <ProductsPageClient products={(data ?? []) as Product[]} />
    </div>
  );
}
