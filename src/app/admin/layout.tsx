import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guards";
import { AdminShell } from "@/components/dashboard/shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  if (!user) redirect("/dashboard");

  return <AdminShell>{children}</AdminShell>;
}
