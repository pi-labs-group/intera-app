import { z } from "zod";

/**
 * Perfis de acesso do Intera (Seção 2.2 da documentação técnica). Responsável e
 * aluno veem as mesmas informações; muda apenas quem aparece como usuário.
 */
export const roleSchema = z.enum([
  "guardian",
  "student",
  "teacher",
  "secretary",
]);

export type Role = z.infer<typeof roleSchema>;

export const loginSchema = z.object({
  role: roleSchema,
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;
