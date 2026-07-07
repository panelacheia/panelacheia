import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/actions/products";
import type { Category, Product } from "@/lib/types";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("product").select("*").eq("id", id).single();
  const { data: categories } = await supabase.from("category").select("*").order("name");

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/produtos"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-brand-primary"
      >
        <ArrowLeft size={16} /> Voltar para Produtos
      </Link>
      <h1 className="mb-4 text-xl font-bold">Editar produto</h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <ProductForm
          product={product as Product}
          categories={(categories ?? []) as Category[]}
          action={updateWithId}
        />
      </div>
    </div>
  );
}
