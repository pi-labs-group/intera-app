import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { roleSchema, type LoginInput, type Role } from "@/lib/validation/auth";

/**
 * AuthService mockado (Seção 8.3 da documentação técnica): login, usuário atual e
 * autorização por papel. Ainda não há banco nem verificação de senha — o perfil
 * escolhido no login fica num cookie httpOnly e define o usuário de demonstração.
 *
 * TODO (fase E): substituir por Supabase Auth, com senha verificada e usuário
 * vindo do banco. O cookie atual não é uma sessão segura: serve só para a demo.
 */

const SESSION_COOKIE = "intera_role";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type SessionUser = {
  role: Role;
  name: string;
  /** Primeiro nome, usado nas saudações. */
  firstName: string;
  /** Linha de contexto sob o nome (ex.: "Mãe de Lucas Andrade"). */
  description: string;
};

/** Aluno exibido para os perfis de aluno e responsável (mesmas informações). */
export const MOCK_STUDENT = {
  name: "Lucas Andrade",
  firstName: "Lucas",
  className: "9º A",
  enrollmentId: "20230045",
  photoUrl:
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
};

export const MOCK_GUARDIAN = {
  name: "Ana Andrade",
  firstName: "Ana",
  relationship: "Mãe",
  phone: "+5511999990000",
};

// TODO (fase E): substituir por dados reais
const MOCK_USERS: Record<Role, SessionUser> = {
  guardian: {
    role: "guardian",
    name: MOCK_GUARDIAN.name,
    firstName: MOCK_GUARDIAN.firstName,
    description: `${MOCK_GUARDIAN.relationship} de ${MOCK_STUDENT.name}`,
  },
  student: {
    role: "student",
    name: MOCK_STUDENT.name,
    firstName: MOCK_STUDENT.firstName,
    description: `Turma ${MOCK_STUDENT.className}`,
  },
  teacher: {
    role: "teacher",
    name: "Renato Lima",
    firstName: "Renato",
    description: "Professor de Matemática",
  },
  secretary: {
    role: "secretary",
    name: "Márcia Souza",
    firstName: "Márcia",
    description: "Secretaria escolar",
  },
};

/**
 * Abre a sessão de demonstração. Os dados já chegam validados pelo schema Zod;
 * qualquer senha é aceita enquanto não houver autenticação real.
 *
 * @param input Perfil, e-mail e senha informados no formulário.
 */
export async function signIn(input: LoginInput): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, input.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Usuário da sessão atual, ou `null` sem sessão. O valor do cookie é validado:
 * um perfil desconhecido é tratado como ausência de sessão. Memoizado por
 * requisição com `cache`, pois layout, página e serviços consultam a sessão.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const parsed = roleSchema.safeParse(cookieStore.get(SESSION_COOKIE)?.value);
  return parsed.success ? MOCK_USERS[parsed.data] : null;
});

/**
 * Garante que há sessão com um dos perfis permitidos. Sem sessão ou com perfil
 * não autorizado, redireciona para o login. Deve ser chamada pelas páginas e
 * serviços, não só pelos layouts: layouts não re-renderizam na navegação.
 *
 * @param allowedRoles Perfis que podem acessar a área.
 * @returns O usuário da sessão.
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    redirect("/login");
  }
  return user;
}
