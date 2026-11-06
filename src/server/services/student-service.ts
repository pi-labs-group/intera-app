import "server-only";

import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import {
  compareWithClass,
  type ClassAggregate,
  type ClassComparison,
} from "@/lib/class-comparison";
import { ROLES } from "@/lib/roles";
import { classLabels } from "@/lib/school-classes";
import { decimalToNumber } from "@/server/db/types";
import {
  aggregateAssignmentGrades,
  listAssignmentGradesByEnrollment,
} from "@/server/repositories/assignment-repository";
import { countAbsencesByEnrollment } from "@/server/repositories/attendance-repository";
import { listDiariesByClass } from "@/server/repositories/diary-repository";
import {
  aggregateBimesterAverages,
  aggregateByDiaries,
  listBimesterAveragesByEnrollment,
  listByEnrollment,
} from "@/server/repositories/grade-repository";
import { listClassIdentities } from "@/server/repositories/school-repository";
import {
  findActiveEnrollment,
  findFirstStudentOfGuardian,
  findStudentByEmail,
} from "@/server/repositories/student-repository";
import type { Bimester } from "@/types/school";
import { requireRole } from "./auth-service";
import { getCurrentSchoolYear } from "./school-calendar-service";

/**
 * Desempenho do aluno da sessão (perfis aluno e responsável). Privacidade: a
 * saída traz só as notas do próprio aluno e, de cada item, o agregado da turma
 * (média e quantidade), nunca notas ou matrículas de colegas.
 */

/** Um item avaliado (avaliação, trabalho ou média do bimestre) com a comparação. */
export type ComparedItem = {
  /** Id do tipo de avaliação, do trabalho ou "average". */
  id: string;
  label: string;
  value: number;
  comparison: ClassComparison;
};

export type BimesterPerformance = {
  bimester: Bimester;
  /** Média do bimestre, só se lançada (D2). */
  average: ComparedItem | null;
  assessments: ComparedItem[];
  assignments: ComparedItem[];
};

export type SubjectPerformance = {
  diaryId: string;
  subject: string;
  icon: string;
  /** Faltas não compensadas no ano. */
  absences: number;
  /** Só os bimestres com alguma nota, do mais recente para o mais antigo. */
  bimesters: BimesterPerformance[];
};

export type StudentPerformance = {
  studentName: string;
  /** `null` quando o aluno não tem matrícula ativa no ano letivo atual. */
  className: string | null;
  subjects: SubjectPerformance[];
};

const DEFAULT_SUBJECT_ICON = "book";
const BIMESTERS_DESC: Bimester[] = [4, 3, 2, 1];
const NO_AGGREGATE: ClassAggregate = { average: null, count: 0 };

/**
 * Aluno da sessão. Enquanto a autenticação for mock, a sessão não tem e-mail: o
 * aluno é encontrado pelo e-mail de demonstração do perfil; o responsável, pelo
 * primeiro aluno vinculado em ordem de nome.
 * TODO (fase de auth): usar o e-mail do usuário autenticado no Supabase.
 * TODO: seletor de aluno para responsável com mais de um vínculo.
 */
export const findSessionStudent = cache(async () => {
  const user = await requireRole(["student", "guardian"]);
  const student =
    user.role === "student"
      ? await findStudentByEmail(ROLES.student.demoEmail)
      : await findFirstStudentOfGuardian(ROLES.guardian.demoEmail);
  if (!student) {
    throw new Error(
      "Aluno da sessão não encontrado no banco. Rode `npm run db:seed`.",
    );
  }
  return student;
});

function toAggregate(
  avg: Prisma.Decimal | null,
  count: number,
): ClassAggregate {
  return { average: avg ? decimalToNumber(avg) : null, count };
}

export async function getStudentPerformance(): Promise<StudentPerformance> {
  const student = await findSessionStudent();
  const schoolYear = await getCurrentSchoolYear();
  const enrollment = schoolYear
    ? await findActiveEnrollment(student.id, schoolYear.id)
    : null;
  if (!schoolYear || !enrollment) {
    return { studentName: student.name, className: null, subjects: [] };
  }

  const diaries = await listDiariesByClass(enrollment.schoolClassId);
  const diaryIds = diaries.map((diary) => diary.id);
  const assignmentIds = diaries.flatMap((diary) =>
    diary.assignments.map((assignment) => assignment.id),
  );

  const [
    grades,
    assignmentGrades,
    averages,
    absences,
    gradeAggregates,
    assignmentAggregates,
    averageAggregates,
    classIdentities,
  ] = await Promise.all([
    listByEnrollment(enrollment.id),
    listAssignmentGradesByEnrollment(enrollment.id),
    listBimesterAveragesByEnrollment(enrollment.id),
    countAbsencesByEnrollment(enrollment.id),
    aggregateByDiaries(diaryIds),
    aggregateAssignmentGrades(assignmentIds),
    aggregateBimesterAverages(diaryIds),
    listClassIdentities(schoolYear.id),
  ]);

  const gradeByKey = new Map(
    grades.map((grade) => [
      `${grade.diaryId}|${grade.bimester}|${grade.assessmentTypeId}`,
      decimalToNumber(grade.value),
    ]),
  );
  const gradeAggregateByKey = new Map(
    gradeAggregates.map((row) => [
      `${row.diaryId}|${row.bimester}|${row.assessmentTypeId}`,
      toAggregate(row._avg.value, row._count._all),
    ]),
  );
  const assignmentGradeById = new Map(
    assignmentGrades.map((grade) => [
      grade.assignmentId,
      decimalToNumber(grade.value),
    ]),
  );
  const assignmentAggregateById = new Map(
    assignmentAggregates.map((row) => [
      row.assignmentId,
      toAggregate(row._avg.value, row._count._all),
    ]),
  );
  const averageByKey = new Map(
    averages.flatMap((row) =>
      row.average
        ? [[`${row.diaryId}|${row.bimester}`, decimalToNumber(row.average)]]
        : [],
    ),
  );
  const averageAggregateByKey = new Map(
    averageAggregates.map((row) => [
      `${row.diaryId}|${row.bimester}`,
      toAggregate(row._avg.average, row._count._all),
    ]),
  );
  const absencesByDiary = new Map(
    absences.map((row) => [row.diaryId, row._count._all]),
  );

  const subjects = diaries.map((diary): SubjectPerformance => {
    const bimesters = BIMESTERS_DESC.map((bimester): BimesterPerformance => {
      const assessments = diary.assessments.flatMap((assessment) => {
        const key = `${diary.id}|${bimester}|${assessment.assessmentTypeId}`;
        const value = gradeByKey.get(key);
        if (value === undefined) return [];
        return [
          {
            id: assessment.assessmentTypeId,
            label: assessment.assessmentType.name,
            value,
            comparison: compareWithClass(
              value,
              gradeAggregateByKey.get(key) ?? NO_AGGREGATE,
            ),
          },
        ];
      });
      const assignments = diary.assignments
        .filter((assignment) => assignment.bimester === bimester)
        .flatMap((assignment) => {
          const value = assignmentGradeById.get(assignment.id);
          if (value === undefined) return [];
          return [
            {
              id: assignment.id,
              label: assignment.title,
              value,
              comparison: compareWithClass(
                value,
                assignmentAggregateById.get(assignment.id) ?? NO_AGGREGATE,
              ),
            },
          ];
        });
      const averageKey = `${diary.id}|${bimester}`;
      const averageValue = averageByKey.get(averageKey);
      const average =
        averageValue === undefined
          ? null
          : {
              id: "average",
              label: "Média do bimestre",
              value: averageValue,
              comparison: compareWithClass(
                averageValue,
                averageAggregateByKey.get(averageKey) ?? NO_AGGREGATE,
              ),
            };
      return { bimester, average, assessments, assignments };
    }).filter(
      (item) =>
        item.average !== null ||
        item.assessments.length > 0 ||
        item.assignments.length > 0,
    );

    return {
      diaryId: diary.id,
      subject: diary.subject.name ?? diary.subject.code,
      icon: diary.subject.icon ?? DEFAULT_SUBJECT_ICON,
      absences: absencesByDiary.get(diary.id) ?? 0,
      bimesters,
    };
  });

  return {
    studentName: student.name,
    className:
      classLabels(classIdentities).get(enrollment.schoolClassId) ??
      `${enrollment.schoolClass.gradeLevel} ${enrollment.schoolClass.name}`,
    subjects,
  };
}
