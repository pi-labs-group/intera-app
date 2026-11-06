import "server-only";

import { db } from "@/server/db/prisma";

/** Aluno vinculado à conta de aluno com o e-mail informado. */
export function findStudentByEmail(email: string) {
  return db().student.findFirst({
    where: { user: { email, role: "student" } },
  });
}

/** Primeiro aluno (por nome) vinculado à conta de responsável com o e-mail informado. */
export async function findFirstStudentOfGuardian(email: string) {
  const link = await db().studentGuardian.findFirst({
    where: { guardian: { user: { email, role: "guardian" } } },
    orderBy: { student: { name: "asc" } },
    include: { student: true },
  });
  return link?.student ?? null;
}

/** Matrícula ativa do aluno no ano letivo, com a turma. */
export function findActiveEnrollment(studentId: string, schoolYearId: number) {
  return db().enrollment.findFirst({
    where: { studentId, status: "active", schoolClass: { schoolYearId } },
    include: { schoolClass: true },
  });
}
