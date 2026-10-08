import "server-only";

import { requireRole } from "./auth-service";

/**
 * Dados da área administrativa (secretaria). Mockados por enquanto; na fase E
 * passam a vir dos repositórios de turmas, disciplinas, usuários e avaliações.
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

// TODO (fase E): substituir por dados reais
const OVERVIEW: SecretaryOverview = {
  lastLegacyImport: "20/09/2026, 09:12",
  classes: [
    { name: "8º A", shift: "Manhã", studentCount: 28, diaryCount: 9 },
    { name: "8º B", shift: "Tarde", studentCount: 25, diaryCount: 9 },
    { name: "9º A", shift: "Manhã", studentCount: 30, diaryCount: 10 },
    { name: "1ª série EM", shift: "Manhã", studentCount: 32, diaryCount: 12 },
  ],
  subjects: [
    { code: "00012", name: "Matemática" },
    { code: "00013", name: "Língua Portuguesa" },
    { code: "00021", name: "Ciências" },
    { code: "00031", name: "História" },
    { code: "00032", name: "Geografia" },
    { code: "00041", name: "Educação Física" },
  ],
  userGroups: [
    { label: "Alunos", icon: "school", count: 115 },
    { label: "Responsáveis", icon: "family_restroom", count: 162 },
    { label: "Professores", icon: "co_present", count: 14 },
    { label: "Secretaria", icon: "badge", count: 2 },
  ],
  assessmentTypes: [
    { code: "P1", name: "Prova 1", diaryCount: 40 },
    { code: "P2", name: "Prova 2", diaryCount: 40 },
    { code: "SIM", name: "Simulado", diaryCount: 22 },
    { code: "TRAB", name: "Trabalho", diaryCount: 31 },
    { code: "PART", name: "Participação", diaryCount: 18 },
    { code: "REC", name: "Recuperação", diaryCount: 40 },
  ],
};

export async function getSecretaryOverview(): Promise<SecretaryOverview> {
  await requireRole(["secretary"]);
  return OVERVIEW;
}
