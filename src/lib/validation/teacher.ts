import { z } from "zod";
import { LESSON_NUMBERS } from "@/lib/gradebook";
import type { Bimester, LessonNumber } from "@/types/school";

/** Data de calendário no formato do `<input type="date">` (AAAA-MM-DD). */
const isoDateSchema = z.iso.date("Informe uma data válida.");

export const bimesterSchema = z
  .number()
  .int()
  .min(1, "Bimestre inválido.")
  .max(4, "Bimestre inválido.")
  .transform((value) => value as Bimester);

const idSchema = z.string().min(1);

/** Campos do formulário "Novo trabalho" (validados no editor e de novo no servidor). */
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

/** Nota digitada, ainda em texto: o servidor a interpreta com `parseGrade`. */
const rawGradeEntrySchema = z.object({
  enrollmentId: idSchema,
  raw: z.string().max(10),
});

/** Lote sem matrícula repetida: duas notas para o mesmo aluno seriam ambíguas. */
const rawGradeBatchSchema = z
  .array(rawGradeEntrySchema)
  .max(200)
  .refine(
    (grades) =>
      new Set(grades.map((grade) => grade.enrollmentId)).size === grades.length,
    "Há aluno repetido no lote.",
  );

export const saveAssessmentGradesSchema = z.object({
  diaryId: idSchema,
  bimester: bimesterSchema,
  assessmentTypeId: idSchema,
  grades: rawGradeBatchSchema,
});

export type SaveAssessmentGradesInput = z.input<
  typeof saveAssessmentGradesSchema
>;

export const createAssignmentSchema = assignmentSchema.extend({
  diaryId: idSchema,
  bimester: bimesterSchema,
  maxGrade: z
    .number()
    .positive("A nota máxima precisa ser positiva.")
    .max(99.99)
    .optional(),
});

export type CreateAssignmentInput = z.input<typeof createAssignmentSchema>;

export const saveAssignmentGradesSchema = z.object({
  assignmentId: idSchema,
  grades: rawGradeBatchSchema,
});

export type SaveAssignmentGradesInput = z.input<
  typeof saveAssignmentGradesSchema
>;

export const saveAttendanceSchema = z.object({
  diaryId: idSchema,
  date: isoDateSchema,
  lessonNumber: z
    .number()
    .int()
    .min(1)
    .max(LESSON_NUMBERS.length)
    .transform((value) => value as LessonNumber),
  absentEnrollmentIds: z.array(idSchema).max(200),
});

export type SaveAttendanceInput = z.input<typeof saveAttendanceSchema>;

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

// Até 2 dígitos inteiros e 2 decimais: cabe em Decimal(4, 2) e recusa formatos
// que `Number()` aceitaria, como "1e1", "0x5" ou "7.".
const GRADE_PATTERN = /^\d{1,2}(?:[.,]\d{1,2})?$/;

/**
 * Interpreta uma nota digitada pelo professor. Aceita vírgula ou ponto decimal
 * ("7,5" ou "7.5"); campo vazio significa nota ainda não lançada (ou apagada).
 * Usada no editor e de novo no servidor, antes de gravar.
 *
 * @param raw Texto digitado no campo.
 * @param maxGrade Nota máxima da avaliação (DiaryAssessment.maxGrade ou Assignment.maxGrade).
 */
export function parseGrade(raw: string, maxGrade: number): GradeParseResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };

  if (!GRADE_PATTERN.test(trimmed)) {
    return { ok: false, error: "Use até 2 casas decimais (ex.: 7,5)." };
  }
  const value = Number(trimmed.replace(",", "."));
  if (value > maxGrade) {
    return {
      ok: false,
      error: `A nota máxima é ${maxGrade.toLocaleString("pt-BR")}.`,
    };
  }
  return { ok: true, value };
}
