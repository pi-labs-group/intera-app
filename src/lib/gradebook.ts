import type { Bimester } from "@/types/school";

/**
 * Chaves e constantes compartilhadas pelo editor de lançamentos (Client
 * Component) e pelo servidor. Ficam fora do editor para o servidor também usar.
 */

/** Código do tipo de avaliação dos trabalhos; gerido na aba Trabalhos (D3). */
export const ASSIGNMENT_ASSESSMENT_CODE = "TRAB";

/** Aulas possíveis num mesmo dia, para o campo "Aula" da chamada. */
export const LESSON_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

/**
 * Chave de uma nota no formato longo (1 linha por aluno, diário, bimestre e
 * avaliação), espelhando a unicidade do modelo Grade no schema Prisma.
 */
export function gradeKey(
  diaryId: string,
  bimester: Bimester,
  assessmentId: string,
  enrollmentId: string,
): string {
  return `${diaryId}|${bimester}|${assessmentId}|${enrollmentId}`;
}

/**
 * Chave da nota de um trabalho (AssignmentGrade). Não inclui o bimestre: ele é
 * atributo do trabalho, não da nota.
 */
export function assignmentGradeKey(
  assignmentId: string,
  enrollmentId: string,
): string {
  return `${assignmentId}|${enrollmentId}`;
}

/** Chave de uma chamada: diário, data (AAAA-MM-DD) e número da aula. */
export function attendanceKey(
  diaryId: string,
  date: string,
  lessonNumber: number,
): string {
  return `${diaryId}|${date}|${lessonNumber}`;
}
