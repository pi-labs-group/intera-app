import "server-only";

import { prisma } from "@/server/db/prisma";

/**
 * Notas lançadas nos diários, de todos os bimestres (formato longo, 1 linha por
 * avaliação). Uma consulta só, pois a tela de lançamentos troca de bimestre e de
 * diário sem voltar ao servidor.
 */
export function listByDiaries(diaryIds: string[]) {
  return prisma.grade.findMany({
    where: { diaryId: { in: diaryIds } },
    select: {
      diaryId: true,
      bimester: true,
      enrollmentId: true,
      assessmentTypeId: true,
      value: true,
    },
  });
}
