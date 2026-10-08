import { z } from "zod";

/** Data de calendário no formato do `<input type="date">` (AAAA-MM-DD). */
const isoDateSchema = z.iso.date("Informe uma data válida.");

export const assignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título precisa de ao menos 3 caracteres.")
    .max(80, "Use no máximo 80 caracteres."),
  dueDate: isoDateSchema,
  description: z.string().trim().max(300, "Use no máximo 300 caracteres."),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const noticeSchema = z.object({
  diaryId: z.string().min(1, "Escolha a turma."),
  priority: z.enum(["aviso", "urgente"]),
  title: z
    .string()
    .trim()
    .min(3, "O título precisa de ao menos 3 caracteres.")
    .max(80, "Use no máximo 80 caracteres."),
  body: z
    .string()
    .trim()
    .min(5, "Escreva a mensagem do aviso.")
    .max(500, "Use no máximo 500 caracteres."),
});

export type NoticeInput = z.infer<typeof noticeSchema>;

export type GradeParseResult =
  { ok: true; value: number | null } | { ok: false; error: string };

/**
 * Interpreta uma nota digitada pelo professor. Aceita vírgula ou ponto decimal
 * ("7,5" ou "7.5"); campo vazio significa nota ainda não lançada.
 *
 * @param raw Texto digitado no campo.
 * @param maxGrade Nota máxima da avaliação (AvaliacaoDoDiario.notaMaxima).
 */
export function parseGrade(raw: string, maxGrade: number): GradeParseResult {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "") return { ok: true, value: null };

  const parsed = z
    .number({ error: "Use apenas números." })
    .min(0, "A nota não pode ser negativa.")
    .max(maxGrade, `A nota máxima é ${maxGrade}.`)
    .safeParse(Number(normalized));

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Nota inválida.",
    };
  }
  return { ok: true, value: parsed.data };
}
