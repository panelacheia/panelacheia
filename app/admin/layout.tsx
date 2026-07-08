import { AdminShell } from "@/components/admin/AdminShell";
import { getMaintenanceMode } from "@/lib/actions/settings";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const maintenanceMode = await getMaintenanceMode();
  return <AdminShell maintenanceMode={maintenanceMode}>{children}</AdminShell>;
}
