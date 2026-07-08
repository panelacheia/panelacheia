"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { removeBackground } from "@/lib/images/removeBackground";
import { normalize } from "@/lib/normalize";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

async function uploadImageIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData
): Promise<string | null> {
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const original = Buffer.from(await file.arrayBuffer());
    const processed = await removeBackground(original);
    const semFundo = processed !== original;

    const path = `${crypto.randomUUID()}.${semFundo ? "png" : (file.name.split(".").pop() ?? "jpg")}`;

    const { error } = await supabase.storage.from("product-images").upload(path, processed, {
      cacheControl: "3600",
      upsert: false,
      contentType: semFundo ? "image/png" : file.type || "image/jpeg",
    });
    if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  // Imagem escolhida na busca do Google Imagens: já foi baixada e salva no bucket (ver ProductForm).
  const chosenUrl = formData.get("chosen_image_url");
  if (typeof chosenUrl === "string" && chosenUrl.length > 0) return chosenUrl;

  return null;
}

async function findDuplicateProductName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const { data } = await supabase.from("product").select("id, name");
  const target = normalize(name);
  return ((data ?? []) as { id: string; name: string }[]).some(
    (p) => p.id !== excludeId && normalize(p.name) === target
  );
}

function parseProductFields(formData: FormData) {
  const priceReais = parseFloat(String(formData.get("price")).replace(",", "."));
  const isPromo = formData.get("is_promo") === "on";

  const originalPriceRaw = String(formData.get("original_price") ?? "").trim();
  const originalPriceReais = originalPriceRaw ? parseFloat(originalPriceRaw.replace(",", ".")) : NaN;
  const original_price_cents =
    isPromo && !Number.isNaN(originalPriceReais) ? Math.round(originalPriceReais * 100) : null;

  const price_cents = Math.round(priceReais * 100);
  if (isPromo && (original_price_cents === null || original_price_cents <= price_cents)) {
    throw new Error(
      'Produto em promoção precisa do "Preço antes" preenchido e maior que o preço atual.'
    );
  }

  return {
    name: String(formData.get("name")),
    price_cents,
    original_price_cents,
    unit: String(formData.get("unit")),
    category_id: String(formData.get("category_id")),
    is_active: formData.get("is_active") === "on",
    is_promo: isPromo,
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await requireStaff();
  const fields = parseProductFields(formData);

  if (await findDuplicateProductName(supabase, fields.name)) {
    throw new Error(`Já existe um produto chamado "${fields.name}".`);
  }

  const imageUrl = await uploadImageIfPresent(supabase, formData);

  const { error } = await supabase.from("product").insert({
    ...fields,
    image_url: imageUrl,
  });
  if (error) throw new Error(`Não foi possível criar o produto: ${error.message}`);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await requireStaff();
  const fields = parseProductFields(formData);

  if (await findDuplicateProductName(supabase, fields.name, id)) {
    throw new Error(`Já existe um produto chamado "${fields.name}".`);
  }

  const imageUrl = await uploadImageIfPresent(supabase, formData);

  const { error } = await supabase
    .from("product")
    .update({
      ...fields,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Não foi possível atualizar o produto: ${error.message}`);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function deleteProduct(id: string) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("product").delete().eq("id", id);
  if (error) throw new Error(`Não foi possível excluir o produto: ${error.message}`);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export type BulkProductRow = {
  nome: string;
  categoria: string;
  unidade: string;
  preco: string;
  promocao: string;
  preco_antes: string;
};

export type BulkImportError = { row: number; message: string };
export type BulkImportResult = { created: string[]; errors: BulkImportError[] };

function parsePrecoReais(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = parseFloat(trimmed.replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function parseSimNao(value: string, padrao: boolean): boolean {
  const v = normalize(value);
  if (!v) return padrao;
  return ["sim", "s", "yes", "y", "1", "true"].includes(v);
}

export async function bulkCreateProducts(rows: BulkProductRow[]): Promise<BulkImportResult> {
  const supabase = await requireStaff();
  const { data: productsData } = await supabase.from("product").select("name");
  const existingProductNames = new Set(
    ((productsData ?? []) as { name: string }[]).map((p) => normalize(p.name))
  );
  const seenInBatch = new Set<string>();

  const { data: categoriesData } = await supabase.from("category").select("id, name");
  const categoryByNormalizedName = new Map<string, { id: string; name: string }>(
    ((categoriesData ?? []) as { id: string; name: string }[]).map((c) => [normalize(c.name), c])
  );

  // Categoria informada na planilha que ainda não existe: cria automaticamente (uma por nome distinto).
  const novasCategorias = new Map<string, string>(); // nome normalizado -> nome original (trim)
  rows.forEach((row) => {
    const nomeCategoria = row.categoria.trim();
    const key = normalize(nomeCategoria);
    if (nomeCategoria && !categoryByNormalizedName.has(key) && !novasCategorias.has(key)) {
      novasCategorias.set(key, nomeCategoria);
    }
  });

  if (novasCategorias.size > 0) {
    const { data: criadas, error } = await supabase
      .from("category")
      .insert(Array.from(novasCategorias.values()).map((name) => ({ name })))
      .select("id, name");
    if (error) {
      return {
        created: [],
        errors: [{ row: 0, message: `Falha ao criar categorias novas: ${error.message}` }],
      };
    }
    (criadas ?? []).forEach((c) => categoryByNormalizedName.set(normalize(c.name), c));
  }

  const errors: BulkImportError[] = [];
  const toInsert: {
    name: string;
    price_cents: number;
    original_price_cents: number | null;
    unit: string;
    category_id: string;
    is_active: boolean;
    is_promo: boolean;
  }[] = [];

  rows.forEach((row, index) => {
    const linha = index + 2; // linha 1 da planilha é o cabeçalho

    const nome = row.nome.trim();
    if (!nome) {
      errors.push({ row: linha, message: "Nome é obrigatório." });
      return;
    }

    const nomeKey = normalize(nome);
    if (existingProductNames.has(nomeKey) || seenInBatch.has(nomeKey)) {
      errors.push({ row: linha, message: `Produto "${nome}" já existe.` });
      return;
    }

    const nomeCategoria = row.categoria.trim();
    if (!nomeCategoria) {
      errors.push({ row: linha, message: "Categoria é obrigatória." });
      return;
    }
    const categoria = categoryByNormalizedName.get(normalize(nomeCategoria));
    if (!categoria) {
      errors.push({ row: linha, message: `Categoria "${row.categoria}" não encontrada.` });
      return;
    }

    const unidade = normalize(row.unidade);
    if (unidade !== "un" && unidade !== "kg") {
      errors.push({ row: linha, message: `Unidade "${row.unidade}" inválida (use "un" ou "kg").` });
      return;
    }

    const preco = parsePrecoReais(row.preco);
    if (preco === null || preco <= 0) {
      errors.push({ row: linha, message: `Preço "${row.preco}" inválido.` });
      return;
    }

    const isPromo = parseSimNao(row.promocao, false);
    let originalPriceCents: number | null = null;
    if (isPromo) {
      const precoAntes = parsePrecoReais(row.preco_antes);
      if (precoAntes === null || precoAntes <= preco) {
        errors.push({
          row: linha,
          message: 'Produto em promoção precisa de "preco_antes" maior que o preço atual.',
        });
        return;
      }
      originalPriceCents = Math.round(precoAntes * 100);
    }

    seenInBatch.add(nomeKey);
    toInsert.push({
      name: nome,
      price_cents: Math.round(preco * 100),
      original_price_cents: originalPriceCents,
      unit: unidade,
      category_id: categoria.id,
      is_active: false, // planilha sempre entra desativada; funcionário ativa após conferir
      is_promo: isPromo,
    });
  });

  if (toInsert.length > 0) {
    const { error } = await supabase.from("product").insert(toInsert);
    if (error) {
      return {
        created: [],
        errors: [...errors, { row: 0, message: `Falha ao salvar produtos: ${error.message}` }],
      };
    }
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { created: toInsert.map((p) => p.name), errors };
}

export async function toggleProductField(
  id: string,
  field: "is_active" | "is_promo",
  value: boolean
) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("product").update({ [field]: value }).eq("id", id);
  if (error) throw new Error(`Não foi possível atualizar o produto: ${error.message}`);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
