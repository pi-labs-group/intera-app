import { AppShell } from "@/components/layout/app-shell";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { requireRole } from "@/server/services/auth-service";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireRole(["student", "guardian"]);
  return <AppShell navItems={NAV_ITEMS}>{children}</AppShell>;
}
