import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/guards";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const safe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    credits: user.credits,
    image: user.image,
  };

  return <DashboardShell user={safe}>{children}</DashboardShell>;
}
