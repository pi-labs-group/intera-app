import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/components/layout/logout-button";
import { logout } from "@/app/login/actions";
import { requireRole } from "@/server/services/auth-service";

export default async function SecretaryLayout({
  children,
}: LayoutProps<"/secretary">) {
  await requireRole(["secretary"]);
  return (
    <AppShell headerAction={<LogoutButton action={logout} />}>
      {children}
    </AppShell>
  );
}
