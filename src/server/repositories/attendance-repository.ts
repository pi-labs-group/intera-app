import "server-only";

import { db } from "@/server/db/prisma";
import type { DbClient } from "@/server/db/types";

/** Faltas já registradas nos diários (matrículas ativas), para o editor reabrir a chamada. */
export function listAbsencesByDiaries(diaryIds: string[]) {
  return db().attendance.findMany({
    where: {
      diaryId: { in: diaryIds },
      present: false,
      enrollment: { status: "active" },
    },
    select: {
      diaryId: true,
      date: true,
      lessonNumber: true,
      enrollmentId: true,
    },
  });
}

/** Faltas não compensadas de uma matrícula, por diário. */
export function countAbsencesByEnrollment(enrollmentId: string) {
  return db().attendance.groupBy({
    by: ["diaryId"],
    where: { enrollmentId, present: false, compensated: false },
    _count: { _all: true },
  });
}

/**
 * Grava a presença de um aluno numa aula. Ao marcar presença, a compensação é
 * zerada: falta compensada pressupõe falta (CHECK attendances_compensated_chk).
 */
export function upsertAttendance(
  client: DbClient,
  key: {
    enrollmentId: string;
    diaryId: string;
    date: Date;
    lessonNumber: number;
  },
  present: boolean,
) {
  return client.attendance.upsert({
    where: { enrollmentId_diaryId_date_lessonNumber: key },
    create: { ...key, present },
    update: present ? { present, compensated: false } : { present },
  });
}
