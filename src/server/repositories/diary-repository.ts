import "server-only";

import { db } from "@/server/db/prisma";
import type { DbClient } from "@/server/db/types";

const activeEnrollment = { status: "active" } as const;

/**
 * Diários do professor no ano letivo, com tudo o que a tela de lançamentos
 * precisa: turma, disciplina, avaliações declaradas, alunos ativos e trabalhos
 * com as notas dos alunos ativos.
 */
export function listDiariesByTeacher(teacherId: string, schoolYearId: number) {
  return db().diary.findMany({
    where: { teacherId, schoolClass: { schoolYearId } },
    orderBy: [
      { schoolClass: { sortOrder: "asc" } },
      { schoolClass: { name: "asc" } },
      { schoolClass: { shift: "asc" } },
    ],
    include: {
      subject: true,
      schoolClass: {
        include: {
          enrollments: {
            where: activeEnrollment,
            orderBy: { callNumber: "asc" },
            include: { student: { select: { name: true } } },
          },
        },
      },
      assessments: {
        orderBy: { order: "asc" },
        include: { assessmentType: true },
      },
      assignments: {
        orderBy: { dueDate: "asc" },
        include: {
          grades: {
            where: { enrollment: activeEnrollment },
            select: { enrollmentId: true, value: true },
          },
        },
      },
    },
  });
}

/** Diários de uma turma, para a tela de desempenho do aluno (sem dados dos colegas). */
export function listDiariesByClass(schoolClassId: string) {
  return db().diary.findMany({
    where: { schoolClassId },
    orderBy: { subject: { name: "asc" } },
    include: {
      subject: true,
      assessments: {
        orderBy: { order: "asc" },
        include: { assessmentType: true },
      },
      assignments: { orderBy: { dueDate: "asc" } },
    },
  });
}

/** Diário com o necessário para autorizar uma gravação (dono, ano, avaliações). */
export function findDiaryForWrite(client: DbClient, diaryId: string) {
  return client.diary.findUnique({
    where: { id: diaryId },
    include: {
      schoolClass: { include: { schoolYear: true } },
      assessments: { include: { assessmentType: true } },
    },
  });
}
