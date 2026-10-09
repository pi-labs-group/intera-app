import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/components/layout/logout-button";
import { TEACHER_NAV_ITEMS } from "@/components/layout/nav-items";
import { logout } from "@/app/login/actions";
import { requireRole } from "@/server/services/auth-service";

export default async function TeacherLayout({
  children,
}: LayoutProps<"/teacher">) {
  await requireRole(["teacher"]);
  return (
    <AppShell
      navItems={TEACHER_NAV_ITEMS}
      headerAction={<LogoutButton action={logout} />}
    >
      {children}
    </AppShell>
  );
}
