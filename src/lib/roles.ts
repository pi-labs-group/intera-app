import type { Role } from "@/lib/validation/auth";

export type RoleInfo = {
  label: string;
  /** Nome do ícone Material Symbols Outlined. */
  icon: string;
  /** Tela inicial do perfil após o login. */
  homePath: string;
  /** E-mail de demonstração pré-preenchido no login mockado. */
  demoEmail: string;
};

// TODO (fase E): os e-mails de demonstração saem quando o login usar o Supabase.
export const ROLES: Record<Role, RoleInfo> = {
  guardian: {
    label: "Responsável",
    icon: "family_restroom",
    homePath: "/home",
    demoEmail: "ana.andrade@familia.com.br",
  },
  student: {
    label: "Aluno",
    icon: "school",
    homePath: "/home",
    demoEmail: "lucas.andrade@aluno.interacao.com.br",
  },
  teacher: {
    label: "Professor",
    icon: "co_present",
    homePath: "/teacher",
    demoEmail: "renato.lima@interacao.com.br",
  },
  secretary: {
    label: "Secretaria",
    icon: "badge",
    homePath: "/secretary",
    demoEmail: "secretaria@interacao.com.br",
  },
};

export const ROLE_ORDER: Role[] = [
  "guardian",
  "student",
  "teacher",
  "secretary",
];
