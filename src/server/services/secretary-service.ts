import "server-only";

import { classLabels } from "@/lib/school-classes";
import {
  countActiveStudents,
  countPeople,
  listAssessmentTypesWithUsage,
  listClassesWithCounts,
  listSubjects,
} from "@/server/repositories/school-repository";
import { requireRole } from "./auth-service";
import { getCurrentSchoolYear } from "./school-calendar-service";

/**
 * Dados da área administrativa (secretaria): turmas, disciplinas, usuários e
 * tipos de avaliação, lidos do banco.
 */

export type SchoolClassSummary = {
  id: string;
  /** Série e letra; inclui o turno quando há duas turmas iguais no ano. */
  name: string;
  shift: string;
  /** Matrículas ativas. */
  studentCount: number;
  diaryCount: number;
};

export type SubjectSummary = {
  /** Código do componente curricular, como aparece na planilha (ex.: "00012"). */
  code: string;
  name: string;
};

export type UserGroupSummary = {
  label: string;
  icon: string;
  count: number;
};

export type AssessmentTypeSummary = {
  code: string;
  name: string;
  /** Quantos diários usam o tipo (DiaryAssessment). */
  diaryCount: number;
};

export type SecretaryOverview = {
  lastLegacyImport: string;
  classes: SchoolClassSummary[];
  subjects: SubjectSummary[];
  userGroups: UserGroupSummary[];
  assessmentTypes: AssessmentTypeSummary[];
};

// TODO: o card de importação legada sai da tela; até lá a data continua mock.
const LAST_LEGACY_IMPORT = "20/09/2026, 09:12";

export async function getSecretaryOverview(): Promise<SecretaryOverview> {
  await requireRole(["secretary"]);
  const schoolYear = await getCurrentSchoolYear();
  const [classes, subjects, assessmentTypes, studentCount, people] =
    await Promise.all([
      schoolYear ? listClassesWithCounts(schoolYear.id) : [],
      listSubjects(),
      listAssessmentTypesWithUsage(),
      schoolYear ? countActiveStudents(schoolYear.id) : 0,
      countPeople(),
    ]);
  const labels = classLabels(classes);

  return {
    lastLegacyImport: LAST_LEGACY_IMPORT,
    classes: classes.map((schoolClass) => ({
      id: schoolClass.id,
      name: labels.get(schoolClass.id) ?? schoolClass.name,
      shift: schoolClass.shift,
      studentCount: schoolClass._count.enrollments,
      diaryCount: schoolClass._count.diaries,
    })),
    subjects: subjects.map((subject) => ({
      code: subject.code,
      name: subject.name ?? subject.code,
    })),
    // Alunos: distintos com matrícula ativa no ano. Responsáveis e professores:
    // pelos cadastros. Secretaria: pelas contas.
    userGroups: [
      { label: "Alunos", icon: "school", count: studentCount },
      {
        label: "Responsáveis",
        icon: "family_restroom",
        count: people.guardians,
      },
      { label: "Professores", icon: "co_present", count: people.teachers },
      { label: "Secretaria", icon: "badge", count: people.secretaries },
    ],
    assessmentTypes: assessmentTypes.map((type) => ({
      code: type.code,
      name: type.name,
      diaryCount: type._count.diaryAssessments,
    })),
  };
}
