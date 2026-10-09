import type { Bimester } from "@/types/school";

/**
 * Chave de uma nota no formato longo (1 linha por aluno, diário, bimestre e
 * avaliação), espelhando a unicidade do modelo Nota no schema Prisma. Fica fora
 * do editor (Client Component) para também ser usada pelo servidor.
 */
export function gradeKey(
  diaryId: string,
  bimester: Bimester,
  assessmentId: string,
  enrollmentId: string,
): string {
  return `${diaryId}|${bimester}|${assessmentId}|${enrollmentId}`;
}
