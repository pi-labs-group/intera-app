import "server-only";

import { db } from "@/server/db/prisma";
import type { DbClient } from "@/server/db/types";

const activeEnrollment = { status: "active" } as const;

export function createAssignment(
  client: DbClient,
  data: {
    diaryId: string;
    bimester: number;
    title: string;
    dueDate: Date;
    description: string;
    maxGrade: number;
  },
) {
  return client.assignment.create({ data });
}

/** Trabalho com o diário, para autorizar a gravação das notas. */
export function findAssignmentForWrite(client: DbClient, assignmentId: string) {
  return client.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      diary: { include: { schoolClass: { include: { schoolYear: true } } } },
    },
  });
}

export function upsertAssignmentGrade(
  client: DbClient,
  assignmentId: string,
  enrollmentId: string,
  value: number,
) {
  return client.assignmentGrade.upsert({
    where: { assignmentId_enrollmentId: { assignmentId, enrollmentId } },
    create: { assignmentId, enrollmentId, value },
    update: { value },
  });
}

/** Apaga a nota do trabalho, se existir (campo esvaziado pelo professor, D6). */
export async function deleteAssignmentGrade(
  client: DbClient,
  assignmentId: string,
  enrollmentId: string,
): Promise<number> {
  const { count } = await client.assignmentGrade.deleteMany({
    where: { assignmentId, enrollmentId },
  });
  return count;
}

/** Notas de trabalho de uma única matrícula (tela do aluno). */
export function listAssignmentGradesByEnrollment(enrollmentId: string) {
  return db().assignmentGrade.findMany({
    where: { enrollmentId },
    select: { assignmentId: true, value: true },
  });
}

/** Média e quantidade de notas por trabalho, só de matrículas ativas. */
export function aggregateAssignmentGrades(assignmentIds: string[]) {
  return db().assignmentGrade.groupBy({
    by: ["assignmentId"],
    where: {
      assignmentId: { in: assignmentIds },
      enrollment: activeEnrollment,
    },
    _avg: { value: true },
    _count: { _all: true },
  });
}
