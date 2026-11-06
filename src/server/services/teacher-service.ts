import "server-only";

import { cache } from "react";
import {
  ASSIGNMENT_ASSESSMENT_CODE,
  assignmentGradeKey,
  attendanceKey,
  gradeKey,
} from "@/lib/gradebook";
import { ROLES } from "@/lib/roles";
import { classLabel, classLabels } from "@/lib/school-classes";
import { DEFAULT_MAX_GRADE } from "@/lib/school-config";
import { decimalToNumber } from "@/server/db/types";
import { listAbsencesByDiaries } from "@/server/repositories/attendance-repository";
import { listDiariesByTeacher } from "@/server/repositories/diary-repository";
import { listByDiaries } from "@/server/repositories/grade-repository";
import { listClassIdentities } from "@/server/repositories/school-repository";
import { findTeacherByEmail } from "@/server/repositories/teacher-repository";
import type { Bimester, Diary, Teacher } from "@/types/school";
import { requireRole } from "./auth-service";
import { getCurrentSchoolYear, toIsoDate } from "./school-calendar-service";

/**
 * Leitura dos diários e das notas do professor da sessão. Cada função verifica a
 * sessão, pois os dados dos alunos só podem chegar ao professor; as notas são
 * buscadas apenas nos diários dele, e só de matrículas ativas.
 */

const DEFAULT_SUBJECT_ICON = "book";
/** Exibido quando o professor ainda não tem diário no ano. */
const NO_SUBJECT = "—";

/**
 * Professor da sessão. Enquanto a autenticação for mock, a sessão não tem e-mail:
 * o professor é encontrado pelo e-mail de demonstração do perfil.
 * TODO (fase de auth): usar o e-mail do usuário autenticado no Supabase.
 */
export const findSessionTeacher = cache(async () => {
  const user = await requireRole(["teacher"]);
  const teacher = await findTeacherByEmail(ROLES[user.role].demoEmail);
  if (!teacher) {
    throw new Error(
      "Professor da sessão não encontrado no banco. Rode `npm run db:seed`.",
    );
  }
  return teacher;
});

const loadSessionDiaries = cache(async () => {
  const [teacher, schoolYear] = await Promise.all([
    findSessionTeacher(),
    getCurrentSchoolYear(),
  ]);
  if (!schoolYear) return [];
  return listDiariesByTeacher(teacher.id, schoolYear.id);
});

/** Rótulos das turmas do ano, com o turno quando há duas turmas iguais. */
const loadClassLabels = cache(async () => {
  const schoolYear = await getCurrentSchoolYear();
  if (!schoolYear) return new Map<string, string>();
  return classLabels(await listClassIdentities(schoolYear.id));
});

/** Nota como o professor digita: vírgula decimal, ex.: "7,5". */
function formatRawGrade(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

export async function getCurrentTeacher(): Promise<Teacher> {
  const [teacher, diaries] = await Promise.all([
    findSessionTeacher(),
    loadSessionDiaries(),
  ]);
  const subjects = new Set(
    diaries.map((diary) => diary.subject.name ?? diary.subject.code),
  );
  return {
    name: teacher.user.name,
    displayName: teacher.displayName,
    subject: subjects.size > 0 ? [...subjects].join(", ") : NO_SUBJECT,
  };
}

/**
 * Diários (turma + disciplina) atribuídos ao professor no ano letivo atual. A
 * avaliação TRAB não entra na lista de avaliações: as notas de trabalho são
 * geridas na aba Trabalhos (D3).
 */
export async function getTeacherDiaries(): Promise<Diary[]> {
  await requireRole(["teacher"]);
  const [diaries, labels] = await Promise.all([
    loadSessionDiaries(),
    loadClassLabels(),
  ]);
  return diaries.map((diary) => ({
    id: diary.id,
    subject: diary.subject.name ?? diary.subject.code,
    subjectIcon: diary.subject.icon ?? DEFAULT_SUBJECT_ICON,
    className:
      labels.get(diary.schoolClass.id) ??
      classLabel(diary.schoolClass, { withShift: false }),
    students: diary.schoolClass.enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      callNumber: enrollment.callNumber,
      name: enrollment.student.name,
    })),
    // O id da avaliação é o do tipo, que é a chave usada nas notas (Grade).
    assessments: diary.assessments
      .filter(
        (assessment) =>
          assessment.assessmentType.code !== ASSIGNMENT_ASSESSMENT_CODE,
      )
      .map((assessment) => ({
        id: assessment.assessmentTypeId,
        code: assessment.assessmentType.code,
        name: assessment.assessmentType.name,
        maxGrade: assessment.maxGrade
          ? decimalToNumber(assessment.maxGrade)
          : DEFAULT_MAX_GRADE,
      })),
    assignments: diary.assignments.map((assignment) => ({
      id: assignment.id,
      // O CHECK assignments_bimester_chk garante 1 a 4.
      bimester: assignment.bimester as Bimester,
      title: assignment.title,
      dueDate: toIsoDate(assignment.dueDate),
      description: assignment.description,
      maxGrade: decimalToNumber(assignment.maxGrade),
    })),
  }));
}

/**
 * Notas já lançadas nos diários do professor, indexadas por `gradeKey` e
 * formatadas como o professor digita (vírgula decimal, ex.: "7,5").
 */
export async function getTeacherGrades(): Promise<Record<string, string>> {
  await requireRole(["teacher"]);
  const diaries = await loadSessionDiaries();
  const grades = await listByDiaries(diaries.map((diary) => diary.id));
  return Object.fromEntries(
    grades.map((grade) => [
      gradeKey(
        grade.diaryId,
        // O CHECK grades_bimester_chk garante 1 a 4.
        grade.bimester as Bimester,
        grade.assessmentTypeId,
        grade.enrollmentId,
      ),
      formatRawGrade(decimalToNumber(grade.value)),
    ]),
  );
}

/** Notas dos trabalhos, indexadas por `assignmentGradeKey` (sem bimestre). */
export async function getTeacherAssignmentGrades(): Promise<
  Record<string, string>
> {
  await requireRole(["teacher"]);
  const diaries = await loadSessionDiaries();
  return Object.fromEntries(
    diaries.flatMap((diary) =>
      diary.assignments.flatMap((assignment) =>
        assignment.grades.map((grade) => [
          assignmentGradeKey(assignment.id, grade.enrollmentId),
          formatRawGrade(decimalToNumber(grade.value)),
        ]),
      ),
    ),
  );
}

/**
 * Faltas já registradas, por `attendanceKey` (diário, data e aula), para o
 * editor reabrir uma chamada com as marcações gravadas em vez de "todos
 * presentes" (o que sobrescreveria as faltas ao salvar de novo).
 */
export async function getTeacherAbsences(): Promise<Record<string, string[]>> {
  await requireRole(["teacher"]);
  const diaries = await loadSessionDiaries();
  const absences = await listAbsencesByDiaries(
    diaries.map((diary) => diary.id),
  );
  const byKey: Record<string, string[]> = {};
  for (const absence of absences) {
    const key = attendanceKey(
      absence.diaryId,
      toIsoDate(absence.date),
      absence.lessonNumber,
    );
    (byKey[key] ??= []).push(absence.enrollmentId);
  }
  return byKey;
}
