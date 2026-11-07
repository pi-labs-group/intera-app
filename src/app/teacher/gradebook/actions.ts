"use server";

import { revalidatePath } from "next/cache";
import type {
  CreateAssignmentInput,
  SaveAssessmentGradesInput,
  SaveAssignmentGradesInput,
  SaveAttendanceInput,
} from "@/lib/validation/teacher";
import {
  createAssignment as createAssignmentService,
  GradeWriteError,
  saveAssessmentGrades as saveAssessmentGradesService,
  saveAssignmentGrades as saveAssignmentGradesService,
  saveAttendance as saveAttendanceService,
} from "@/server/services/grade-write-service";
import type { Assignment } from "@/types/school";

/**
 * Server Actions da tela de lançamentos. Só traduzem o resultado do serviço
 * para a tela: a validação e as checagens de permissão ficam no serviço.
 */

export type ActionResult<Data = undefined> =
  | { ok: true; message: string; data: Data }
  | {
      ok: false;
      message: string;
      /** Erros por campo ou por matrícula, no mesmo formato do login. */
      fieldErrors?: Record<string, string>;
    };

const GRADEBOOK_PATH = "/teacher/gradebook";

async function run<Result, Data>(
  write: () => Promise<Result>,
  toSuccess: (result: Result) => { message: string; data: Data },
): Promise<ActionResult<Data>> {
  try {
    const result = await write();
    revalidatePath(GRADEBOOK_PATH);
    return { ok: true, ...toSuccess(result) };
  } catch (error) {
    if (error instanceof GradeWriteError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    // Erros de autenticação (redirect) e inesperados seguem o fluxo do Next.
    throw error;
  }
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function describeWrite({ saved, deleted }: { saved: number; deleted: number }) {
  const parts = [plural(saved, "nota salva", "notas salvas")];
  if (deleted > 0) parts.push(plural(deleted, "apagada", "apagadas"));
  return parts.join(", ");
}

export async function saveAssessmentGrades(
  input: SaveAssessmentGradesInput & { assessmentName: string },
): Promise<ActionResult> {
  const { assessmentName, ...data } = input;
  return run(
    () => saveAssessmentGradesService(data),
    (summary) => ({
      message: `${assessmentName}: ${describeWrite(summary)} no ${data.bimester}º bimestre.`,
      data: undefined,
    }),
  );
}

export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<ActionResult<Assignment>> {
  return run(
    () => createAssignmentService(input),
    (assignment) => ({
      message: `Trabalho "${assignment.title}" cadastrado no ${assignment.bimester}º bimestre. Lance as notas abaixo.`,
      data: assignment,
    }),
  );
}

export async function saveAssignmentGrades(
  input: SaveAssignmentGradesInput & { assignmentTitle: string },
): Promise<ActionResult> {
  const { assignmentTitle, ...data } = input;
  return run(
    () => saveAssignmentGradesService(data),
    (summary) => ({
      message: `Trabalho "${assignmentTitle}": ${describeWrite(summary)}.`,
      data: undefined,
    }),
  );
}

export async function saveAttendance(
  input: SaveAttendanceInput,
): Promise<ActionResult> {
  return run(
    () => saveAttendanceService(input),
    ({ absent }) => {
      const [year, month, day] = input.date.split("-");
      return {
        message: `Chamada de ${day}/${month}/${year} (${input.lessonNumber}ª aula) salva: ${plural(absent, "falta", "faltas")}.`,
        data: undefined,
      };
    },
  );
}
