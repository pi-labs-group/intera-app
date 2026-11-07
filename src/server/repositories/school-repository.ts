import "server-only";

import { db } from "@/server/db/prisma";

/**
 * Turmas do ano letivo com a quantidade de matrículas ativas e de diários, na
 * mesma ordem da tela do professor (`sortOrder`).
 */
export function listClassesWithCounts(schoolYearId: number) {
  return db().schoolClass.findMany({
    where: { schoolYearId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { shift: "asc" }],
    include: {
      _count: {
        select: {
          enrollments: { where: { status: "active" } },
          diaries: true,
        },
      },
    },
  });
}

/** Série, letra e turno de todas as turmas do ano, para desambiguar rótulos. */
export function listClassIdentities(schoolYearId: number) {
  return db().schoolClass.findMany({
    where: { schoolYearId },
    select: { id: true, gradeLevel: true, name: true, shift: true },
  });
}

export function listSubjects() {
  return db().subject.findMany({ orderBy: { code: "asc" } });
}

/** Tipos de avaliação com a quantidade de diários que os declaram. */
export function listAssessmentTypesWithUsage() {
  return db().assessmentType.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { diaryAssessments: true } } },
  });
}

/** Alunos distintos com matrícula ativa no ano (com ou sem conta de acesso). */
export function countActiveStudents(schoolYearId: number) {
  return db().student.count({
    where: {
      enrollments: {
        some: { status: "active", schoolClass: { schoolYearId } },
      },
    },
  });
}

/**
 * Responsáveis e professores contados pelos cadastros (Guardian, Teacher), e
 * não pelo perfil da conta; a secretaria não tem cadastro além da conta.
 */
export async function countPeople() {
  const [guardians, teachers, secretaries] = await Promise.all([
    db().guardian.count(),
    db().teacher.count(),
    db().user.count({ where: { role: "secretary" } }),
  ]);
  return { guardians, teachers, secretaries };
}
