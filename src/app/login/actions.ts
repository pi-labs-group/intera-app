"use server";

import { redirect } from "next/navigation";
import { ROLES } from "@/lib/roles";
import { loginSchema } from "@/lib/validation/auth";
import { signIn, signOut } from "@/server/services/auth-service";

export type LoginFormState = {
  /** Erros por campo, exibidos junto de cada input. */
  fieldErrors?: Partial<Record<"role" | "email" | "password", string>>;
};

/** Valida o formulário na borda e abre a sessão de demonstração do perfil escolhido. */
export async function login(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    role: formData.get("role"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "role") fieldErrors.role = "Escolha um perfil de acesso.";
      if (field === "email") fieldErrors.email ??= issue.message;
      if (field === "password") fieldErrors.password ??= issue.message;
    }
    return { fieldErrors };
  }

  await signIn(parsed.data);
  redirect(ROLES[parsed.data.role].homePath);
}

export async function logout(): Promise<void> {
  await signOut();
  redirect("/login");
}
