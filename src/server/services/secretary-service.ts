import "server-only";

import type { Role } from "@/lib/validation/auth";
import {
  countStudents,
  countUsersByRole,
  listAssessmentTypesWithUsage,
  listClassesWithCounts,
  listSubjects,
} from "@/server/repositories/school-repository";
import { requireRole } from "./auth-service";

/**
 * Dados da área administrativa (secretaria): turmas, disciplinas, usuários e
 * tipos de avaliação, lidos do banco.
 */

export type SchoolClassSummary = {
  name: string;
  shift: string;
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
  /** Quantos diários usam o tipo (AvaliacaoDoDiario). */
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

// Grupos exibidos nos cards de usuários. Alunos contam todos os cadastrados,
// com ou sem conta de acesso; os demais perfis contam as contas.
const USER_GROUPS: { label: string; icon: string; role: Role }[] = [
  { label: "Alunos", icon: "school", role: "student" },
  { label: "Responsáveis", icon: "family_restroom", role: "guardian" },
  { label: "Professores", icon: "co_present", role: "teacher" },
  { label: "Secretaria", icon: "badge", role: "secretary" },
];

function currentSchoolYear(): number {
  const year = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date());
  return Number(year);
}

export async function getSecretaryOverview(): Promise<SecretaryOverview> {
  await requireRole(["secretary"]);
  const [classes, subjects, assessmentTypes, studentCount, usersByRole] =
    await Promise.all([
      listClassesWithCounts(currentSchoolYear()),
      listSubjects(),
      listAssessmentTypesWithUsage(),
      countStudents(),
      countUsersByRole(),
    ]);
  const accountsByRole = new Map(
    usersByRole.map((group) => [group.role, group._count._all]),
  );

  return {
    lastLegacyImport: LAST_LEGACY_IMPORT,
    classes: classes.map((schoolClass) => ({
      name: `${schoolClass.gradeLevel} ${schoolClass.name}`,
      shift: schoolClass.shift,
      studentCount: schoolClass._count.enrollments,
      diaryCount: schoolClass._count.diaries,
    })),
    subjects: subjects.map((subject) => ({
      code: subject.code,
      name: subject.name ?? subject.code,
    })),
    userGroups: USER_GROUPS.map(({ label, icon, role }) => ({
      label,
      icon,
      count:
        role === "student" ? studentCount : (accountsByRole.get(role) ?? 0),
    })),
    assessmentTypes: assessmentTypes.map((type) => ({
      code: type.code,
      name: type.name,
      diaryCount: type._count.diaryAssessments,
    })),
  };
}
