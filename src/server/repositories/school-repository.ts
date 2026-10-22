import "server-only";

import { prisma } from "@/server/db/prisma";

/** Turmas do ano letivo com a quantidade de matrículas e de diários. */
export function listClassesWithCounts(schoolYear: number) {
  return prisma.schoolClass.findMany({
    where: { schoolYear: { year: schoolYear } },
    orderBy: [
      { educationLevel: "asc" },
      { gradeLevel: "asc" },
      { name: "asc" },
    ],
    include: { _count: { select: { enrollments: true, diaries: true } } },
  });
}

export function listSubjects() {
  return prisma.subject.findMany({ orderBy: { code: "asc" } });
}

/** Tipos de avaliação com a quantidade de diários que os declaram. */
export function listAssessmentTypesWithUsage() {
  return prisma.assessmentType.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { diaryAssessments: true } } },
  });
}

export function countStudents() {
  return prisma.student.count();
}

export function countUsersByRole() {
  return prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
}
