import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/actions/products";
import type { Product } from "@/lib/types";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("product").select("*").eq("id", id).single();

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Editar produto</h1>
      <ProductForm product={product as Product} action={updateWithId} />
    </div>
  );
}
