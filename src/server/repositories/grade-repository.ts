import "server-only";

import { db } from "@/server/db/prisma";
import type { DbClient } from "@/server/db/types";

const activeEnrollment = { status: "active" } as const;

/**
 * Notas lançadas nos diários, de todos os bimestres (formato longo, 1 linha por
 * avaliação), só de matrículas ativas. Uma consulta só, pois a tela de
 * lançamentos troca de bimestre e de diário sem voltar ao servidor.
 */
export function listByDiaries(diaryIds: string[]) {
  return db().grade.findMany({
    where: { diaryId: { in: diaryIds }, enrollment: activeEnrollment },
    select: {
      diaryId: true,
      bimester: true,
      enrollmentId: true,
      assessmentTypeId: true,
      value: true,
    },
  });
}

/** Notas de uma única matrícula (tela do aluno: nunca as dos colegas). */
export function listByEnrollment(enrollmentId: string) {
  return db().grade.findMany({
    where: { enrollmentId },
    select: {
      diaryId: true,
      bimester: true,
      assessmentTypeId: true,
      value: true,
    },
  });
}

/**
 * Média e quantidade de notas por diário, bimestre e avaliação, só de
 * matrículas ativas. Devolve apenas agregados: é o que pode chegar ao aluno.
 */
export function aggregateByDiaries(diaryIds: string[]) {
  return db().grade.groupBy({
    by: ["diaryId", "bimester", "assessmentTypeId"],
    where: { diaryId: { in: diaryIds }, enrollment: activeEnrollment },
    _avg: { value: true },
    _count: { _all: true },
  });
}

type GradeKey = {
  enrollmentId: string;
  diaryId: string;
  bimester: number;
  assessmentTypeId: string;
};

export function upsertGrade(client: DbClient, key: GradeKey, value: number) {
  return client.grade.upsert({
    where: { enrollmentId_diaryId_bimester_assessmentTypeId: key },
    create: { ...key, value },
    update: { value },
  });
}

/** Apaga a nota, se existir (campo esvaziado pelo professor, D6). */
export async function deleteGrade(
  client: DbClient,
  key: GradeKey,
): Promise<number> {
  const { count } = await client.grade.deleteMany({ where: key });
  return count;
}

/** Médias de bimestre de uma matrícula (só existem se lançadas, D2). */
export function listBimesterAveragesByEnrollment(enrollmentId: string) {
  return db().bimesterAverage.findMany({
    where: { enrollmentId },
    select: { diaryId: true, bimester: true, average: true },
  });
}

/** Média das médias de bimestre lançadas, por diário e bimestre (matrículas ativas). */
export function aggregateBimesterAverages(diaryIds: string[]) {
  return db().bimesterAverage.groupBy({
    by: ["diaryId", "bimester"],
    where: {
      diaryId: { in: diaryIds },
      average: { not: null },
      enrollment: activeEnrollment,
    },
    _avg: { average: true },
    _count: { _all: true },
  });
}
