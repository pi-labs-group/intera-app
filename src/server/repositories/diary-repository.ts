import "server-only";

import { prisma } from "@/server/db/prisma";

/**
 * Diários do professor no ano letivo, com tudo o que a tela de lançamentos
 * precisa: turma, disciplina, avaliações declaradas, alunos e trabalhos.
 */
export function listDiariesByTeacher(teacherId: string, schoolYear: number) {
  return prisma.diary.findMany({
    where: { teacherId, schoolClass: { schoolYear: { year: schoolYear } } },
    // Séries mais avançadas primeiro (EM antes de EF; 9º antes de 8º).
    orderBy: [
      { schoolClass: { educationLevel: "desc" } },
      { schoolClass: { gradeLevel: "desc" } },
      { schoolClass: { name: "asc" } },
    ],
    include: {
      subject: true,
      schoolClass: {
        include: {
          enrollments: {
            orderBy: { callNumber: "asc" },
            include: { student: { select: { name: true } } },
          },
        },
      },
      assessments: {
        orderBy: { order: "asc" },
        include: { assessmentType: true },
      },
      assignments: { orderBy: { dueDate: "asc" } },
    },
  });
}
