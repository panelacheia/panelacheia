"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/lib/types";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
  const supabase = await requireStaff();
  const { error } = await supabase
    .from("order")
    .update({ payment_status: paymentStatus })
    .eq("id", id);
  if (error) throw new Error(`Não foi possível atualizar o status de pagamento: ${error.message}`);

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}

export async function updateInternalNotes(id: string, notes: string) {
  const supabase = await requireStaff();
  const { error } = await supabase
    .from("order")
    .update({ internal_notes: notes })
    .eq("id", id);
  if (error) throw new Error(`Não foi possível salvar a observação: ${error.message}`);

  revalidatePath(`/admin/pedidos/${id}`);
}
