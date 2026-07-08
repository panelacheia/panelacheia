import { createClient } from "@/lib/supabase/server";
import { ImagesPageClient } from "@/components/admin/ImagesPageClient";
import type { StorageImage } from "@/lib/types";

export const revalidate = 0;

export default async function AdminImagensPage() {
  const supabase = await createClient();
  const { data } = await supabase.storage.from("product-images").list("", {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });

  const images: StorageImage[] = (data ?? [])
    .filter((f) => f.id)
    .map((f) => ({
      name: f.name,
      url: supabase.storage.from("product-images").getPublicUrl(f.name).data.publicUrl,
      sizeBytes: (f.metadata as { size?: number } | null)?.size ?? 0,
    }));

  return <ImagesPageClient images={images} />;
}
