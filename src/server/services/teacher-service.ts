import "server-only";

import { cache } from "react";
import { gradeKey } from "@/lib/gradebook";
import { ROLES } from "@/lib/roles";
import { listDiariesByTeacher } from "@/server/repositories/diary-repository";
import { listByDiaries } from "@/server/repositories/grade-repository";
import { findTeacherByEmail } from "@/server/repositories/teacher-repository";
import type { Bimester, Diary, Teacher } from "@/types/school";
import { requireRole } from "./auth-service";

/**
 * Leitura dos diários e das notas do professor da sessão. Cada função verifica a
 * sessão, pois os dados dos alunos só podem chegar ao professor; as notas são
 * buscadas apenas nos diários dele.
 */

// Diário sem nota máxima definida (DiaryAssessment.maxGrade nulo) usa a escala 0–10.
const DEFAULT_MAX_GRADE = 10;
const DEFAULT_SUBJECT_ICON = "book";

function currentSchoolYear(): number {
  const year = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date());
  return Number(year);
}

/**
 * Professor da sessão. Enquanto a autenticação for mock, a sessão não tem e-mail:
 * o professor é encontrado pelo e-mail de demonstração do perfil.
 * TODO (fase de auth): usar o e-mail do usuário autenticado no Supabase.
 */
const findSessionTeacher = cache(async () => {
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
  const teacher = await findSessionTeacher();
  return listDiariesByTeacher(teacher.id, currentSchoolYear());
});

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
    subject: [...subjects].join(", "),
  };
}

/** Diários (turma + disciplina) atribuídos ao professor no ano letivo atual. */
export async function getTeacherDiaries(): Promise<Diary[]> {
  const diaries = await loadSessionDiaries();
  return diaries.map((diary) => ({
    id: diary.id,
    subject: diary.subject.name ?? diary.subject.code,
    subjectIcon: diary.subject.icon ?? DEFAULT_SUBJECT_ICON,
    className: `${diary.schoolClass.gradeLevel} ${diary.schoolClass.name}`,
    students: diary.schoolClass.enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      callNumber: enrollment.callNumber,
      name: enrollment.student.name,
    })),
    // O id da avaliação é o do tipo, que é a chave usada nas notas (Grade).
    assessments: diary.assessments.map((assessment) => ({
      id: assessment.assessmentTypeId,
      code: assessment.assessmentType.code,
      name: assessment.assessmentType.name,
      maxGrade: assessment.maxGrade?.toNumber() ?? DEFAULT_MAX_GRADE,
    })),
    assignments: diary.assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      dueDate: assignment.dueDate.toISOString().slice(0, 10),
      description: assignment.description,
    })),
  }));
}

/**
 * Notas já lançadas nos diários do professor, indexadas por `gradeKey` e
 * formatadas como o professor digita (vírgula decimal, ex.: "7,5").
 */
export async function getTeacherGrades(): Promise<Record<string, string>> {
  const diaries = await loadSessionDiaries();
  const grades = await listByDiaries(diaries.map((diary) => diary.id));
  return Object.fromEntries(
    grades.map((grade) => [
      gradeKey(
        grade.diaryId,
        grade.bimester as Bimester,
        grade.assessmentTypeId,
        grade.enrollmentId,
      ),
      grade.value.toNumber().toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }),
    ]),
  );
}
