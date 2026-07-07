import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/products";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Novo produto</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
