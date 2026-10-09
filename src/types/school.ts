/**
 * Tipos do domínio escolar usados pelas telas mockadas. Espelham, de forma
 * simplificada, os modelos do schema Prisma (Apêndice A da documentação):
 * Diario, Matricula, TipoAvaliacao e AvaliacaoDoDiario.
 */

/** Aluno dentro de um diário (vínculo Matricula: o nº de chamada é da turma). */
export type DiaryStudent = {
  enrollmentId: string;
  callNumber: number;
  name: string;
};

/** Tipo de avaliação declarado pelo diário (AvaliacaoDoDiario + TipoAvaliacao). */
export type DiaryAssessment = {
  id: string;
  code: string;
  name: string;
  maxGrade: number;
};

/** Trabalho cadastrado pelo professor; a nota entra como avaliação do tipo TRAB. */
export type Assignment = {
  id: string;
  title: string;
  /** Data no formato ISO (AAAA-MM-DD). */
  dueDate: string;
  description: string;
};

/** Diário de classe: turma + disciplina no ano letivo. */
export type Diary = {
  id: string;
  subject: string;
  /** Nome do ícone Material Symbols Outlined da disciplina. */
  subjectIcon: string;
  className: string;
  students: DiaryStudent[];
  assessments: DiaryAssessment[];
  assignments: Assignment[];
};

export type Bimester = 1 | 2 | 3 | 4;

export type Teacher = {
  name: string;
  /** Forma de tratamento exibida (ex.: "Prof. Renato"). */
  displayName: string;
  subject: string;
};
