import "server-only";

import type { z } from "zod";
import { ASSIGNMENT_ASSESSMENT_CODE } from "@/lib/gradebook";
import { isWithinSchoolPeriods, todayInSaoPaulo } from "@/lib/school-calendar";
import { DEFAULT_MAX_GRADE } from "@/lib/school-config";
import {
  createAssignmentSchema,
  parseGrade,
  saveAssessmentGradesSchema,
  saveAssignmentGradesSchema,
  saveAttendanceSchema,
  type CreateAssignmentInput,
  type SaveAssessmentGradesInput,
  type SaveAssignmentGradesInput,
  type SaveAttendanceInput,
} from "@/lib/validation/teacher";
import { db } from "@/server/db/prisma";
import { decimalToNumber, type DbClient } from "@/server/db/types";
import {
  createAssignment as insertAssignment,
  deleteAssignmentGrade,
  findAssignmentForWrite,
  upsertAssignmentGrade,
} from "@/server/repositories/assignment-repository";
import { upsertAttendance } from "@/server/repositories/attendance-repository";
import { findDiaryForWrite } from "@/server/repositories/diary-repository";
import { listActiveEnrollmentIds } from "@/server/repositories/enrollment-repository";
import {
  deleteGrade,
  upsertGrade,
} from "@/server/repositories/grade-repository";
import { listPeriods } from "@/server/repositories/school-calendar-repository";
import type { Assignment, Bimester } from "@/types/school";
import { findSessionTeacher } from "./teacher-service";
import { toIsoDate, toPeriodRange } from "./school-calendar-service";

/**
 * Gravações do professor: notas de avaliação, trabalhos, notas de trabalho e
 * chamada. Nada vindo do navegador é confiável: cada função revalida a entrada
 * com Zod e confere, na mesma transação da gravação, que o diário é do
 * professor da sessão e do ano letivo atual e que todas as matrículas estão
 * ativas na turma. Um lote com qualquer item inválido é recusado inteiro.
 */

/** Recusa de uma gravação; a mensagem vai para a tela como está. */
export class GradeWriteError extends Error {
  constructor(
    message: string,
    /** Erros por campo ou por matrícula (chave: enrollmentId). */
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "GradeWriteError";
  }
}

export type WriteSummary = { saved: number; deleted: number };

function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): z.output<Schema> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return parsed.data;
  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const field = String(issue.path[0] ?? "form");
    fieldErrors[field] ??= issue.message;
  }
  throw new GradeWriteError("Revise os dados informados.", fieldErrors);
}

/** Diário do professor da sessão, no ano letivo atual; recusa os demais. */
async function loadOwnedDiary(
  client: DbClient,
  diaryId: string,
  teacherId: string,
) {
  const diary = await findDiaryForWrite(client, diaryId);
  // Diário inexistente e diário de outro professor dão a mesma resposta, para
  // não revelar quais ids existem.
  if (!diary || diary.teacherId !== teacherId) {
    throw new GradeWriteError("Diário não encontrado entre os seus.");
  }
  if (!diary.schoolClass.schoolYear.isCurrent) {
    throw new GradeWriteError(
      "Este diário não é do ano letivo atual; não aceita lançamentos.",
    );
  }
  return diary;
}

async function assertActiveEnrollments(
  client: DbClient,
  schoolClassId: string,
  enrollmentIds: string[],
): Promise<void> {
  const active = await listActiveEnrollmentIds(client, schoolClassId);
  if (enrollmentIds.some((id) => !active.has(id))) {
    throw new GradeWriteError(
      "Há aluno que não está matriculado nesta turma. Nada foi salvo.",
    );
  }
}

/** Interpreta o lote inteiro; qualquer nota inválida recusa o lote. */
function parseGradeBatch(
  grades: { enrollmentId: string; raw: string }[],
  maxGrade: number,
): { enrollmentId: string; value: number | null }[] {
  const fieldErrors: Record<string, string> = {};
  const parsed = grades.map(({ enrollmentId, raw }) => {
    const result = parseGrade(raw, maxGrade);
    if (!result.ok) fieldErrors[enrollmentId] = result.error;
    return { enrollmentId, value: result.ok ? result.value : null };
  });
  const invalidCount = Object.keys(fieldErrors).length;
  if (invalidCount > 0) {
    throw new GradeWriteError(
      `Corrija ${invalidCount} ${invalidCount === 1 ? "nota inválida" : "notas inválidas"}. Nada foi salvo.`,
      fieldErrors,
    );
  }
  return parsed;
}

/**
 * Salva as notas de uma avaliação do diário num bimestre. Campo vazio apaga a
 * nota existente (D6). A avaliação precisa estar declarada no diário e não pode
 * ser TRAB (as notas de trabalho ficam em AssignmentGrade, D3).
 */
export async function saveAssessmentGrades(
  input: SaveAssessmentGradesInput,
): Promise<WriteSummary> {
  const data = parseInput(saveAssessmentGradesSchema, input);
  const teacher = await findSessionTeacher();

  return db().$transaction(async (tx) => {
    const diary = await loadOwnedDiary(tx, data.diaryId, teacher.id);
    const assessment = diary.assessments.find(
      (item) => item.assessmentTypeId === data.assessmentTypeId,
    );
    if (
      !assessment ||
      assessment.assessmentType.code === ASSIGNMENT_ASSESSMENT_CODE
    ) {
      throw new GradeWriteError("Avaliação não declarada neste diário.");
    }
    const maxGrade = assessment.maxGrade
      ? decimalToNumber(assessment.maxGrade)
      : DEFAULT_MAX_GRADE;
    const grades = parseGradeBatch(data.grades, maxGrade);
    await assertActiveEnrollments(
      tx,
      diary.schoolClassId,
      grades.map((grade) => grade.enrollmentId),
    );

    const summary: WriteSummary = { saved: 0, deleted: 0 };
    for (const { enrollmentId, value } of grades) {
      const key = {
        enrollmentId,
        diaryId: diary.id,
        bimester: data.bimester,
        assessmentTypeId: data.assessmentTypeId,
      };
      if (value === null) {
        summary.deleted += await deleteGrade(tx, key);
      } else {
        await upsertGrade(tx, key, value);
        summary.saved += 1;
      }
    }
    return summary;
  });
}

/** Cadastra um trabalho no diário, no bimestre informado. */
export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<Assignment> {
  const data = parseInput(createAssignmentSchema, input);
  const teacher = await findSessionTeacher();

  return db().$transaction(async (tx) => {
    const diary = await loadOwnedDiary(tx, data.diaryId, teacher.id);
    const created = await insertAssignment(tx, {
      diaryId: diary.id,
      bimester: data.bimester,
      title: data.title,
      dueDate: new Date(`${data.dueDate}T00:00:00Z`),
      description: data.description,
      maxGrade: data.maxGrade ?? DEFAULT_MAX_GRADE,
    });
    return {
      id: created.id,
      bimester: created.bimester as Bimester,
      title: created.title,
      dueDate: toIsoDate(created.dueDate),
      description: created.description,
      maxGrade: decimalToNumber(created.maxGrade),
    };
  });
}

/** Salva as notas de um trabalho; o limite é a nota máxima do trabalho. */
export async function saveAssignmentGrades(
  input: SaveAssignmentGradesInput,
): Promise<WriteSummary> {
  const data = parseInput(saveAssignmentGradesSchema, input);
  const teacher = await findSessionTeacher();

  return db().$transaction(async (tx) => {
    const assignment = await findAssignmentForWrite(tx, data.assignmentId);
    if (!assignment) {
      throw new GradeWriteError("Trabalho não encontrado entre os seus.");
    }
    const diary = await loadOwnedDiary(tx, assignment.diaryId, teacher.id);
    const grades = parseGradeBatch(
      data.grades,
      decimalToNumber(assignment.maxGrade),
    );
    await assertActiveEnrollments(
      tx,
      diary.schoolClassId,
      grades.map((grade) => grade.enrollmentId),
    );

    const summary: WriteSummary = { saved: 0, deleted: 0 };
    for (const { enrollmentId, value } of grades) {
      if (value === null) {
        summary.deleted += await deleteAssignmentGrade(
          tx,
          assignment.id,
          enrollmentId,
        );
      } else {
        await upsertAssignmentGrade(tx, assignment.id, enrollmentId, value);
        summary.saved += 1;
      }
    }
    return summary;
  });
}

/**
 * Grava a chamada de uma aula: uma linha por aluno ativo da turma, com falta
 * para os informados e presença para os demais. A data não pode ser futura e
 * precisa cair num bimestre do ano letivo.
 */
export async function saveAttendance(
  input: SaveAttendanceInput,
): Promise<{ present: number; absent: number }> {
  const data = parseInput(saveAttendanceSchema, input);
  const teacher = await findSessionTeacher();

  if (data.date > todayInSaoPaulo(new Date())) {
    throw new GradeWriteError(
      "Não é possível registrar chamada de data futura.",
      {
        date: "A data não pode ser futura.",
      },
    );
  }

  return db().$transaction(async (tx) => {
    const diary = await loadOwnedDiary(tx, data.diaryId, teacher.id);
    const periods = (await listPeriods(diary.schoolClass.schoolYearId)).map(
      toPeriodRange,
    );
    if (!isWithinSchoolPeriods(periods, data.date)) {
      throw new GradeWriteError(
        "A data não cai em nenhum bimestre do ano letivo.",
        {
          date: "Escolha uma data dentro de um bimestre.",
        },
      );
    }
    const active = await listActiveEnrollmentIds(tx, diary.schoolClassId);
    const absent = new Set(data.absentEnrollmentIds);
    if ([...absent].some((id) => !active.has(id))) {
      throw new GradeWriteError(
        "Há aluno que não está matriculado nesta turma. Nada foi salvo.",
      );
    }

    // A data vem como AAAA-MM-DD; o horário em UTC evita que o fuso do
    // servidor desloque o dia gravado na coluna DATE.
    const date = new Date(`${data.date}T00:00:00Z`);
    for (const enrollmentId of active) {
      await upsertAttendance(
        tx,
        {
          enrollmentId,
          diaryId: diary.id,
          date,
          lessonNumber: data.lessonNumber,
        },
        !absent.has(enrollmentId),
      );
    }
    return { present: active.size - absent.size, absent: absent.size };
  });
}
