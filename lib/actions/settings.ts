"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function getMaintenanceMode(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_status")
    .select("maintenance_mode")
    .eq("id", 1)
    .single();
  return data?.maintenance_mode ?? false;
}

export async function setMaintenanceMode(enabled: boolean) {
  const supabase = await requireStaff();
  const { error } = await supabase
    .from("store_status")
    .update({ maintenance_mode: enabled, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(`Não foi possível atualizar o status da loja: ${error.message}`);

  revalidatePath("/", "layout");
}
