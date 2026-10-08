import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { ROLES } from "@/lib/roles";
import { getCurrentUser } from "@/server/services/auth-service";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar · Intera",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(ROLES[user.role].homePath);

  return (
    <div className="flex flex-1 justify-center bg-neutral-50">
      <div className="flex min-h-screen w-full max-w-md flex-col bg-background shadow-2xl">
        <header className="flex flex-col items-center gap-2 bg-primary px-4 pt-14 pb-10 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
            <Logo className="h-11 w-11" />
          </div>
          <h1 className="text-2xl font-bold">Intera</h1>
          <p className="text-sm text-primary-soft">Escola Interação</p>
        </header>

        <main className="flex-1 px-4 py-6">
          <LoginForm />
        </main>

        <footer className="px-4 pb-6 text-center text-xs text-neutral-500">
          Acesso para alunos, responsáveis, professores e secretaria da Escola
          Interação.
        </footer>
      </div>
    </div>
  );
}
