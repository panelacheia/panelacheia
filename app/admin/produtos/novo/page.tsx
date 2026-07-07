import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/products";
import type { Category } from "@/lib/types";

export default async function NovoProdutoPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("category").select("*").order("name");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Novo produto</h1>
      <ProductForm categories={(categories ?? []) as Category[]} action={createProduct} />
    </div>
  );
}
