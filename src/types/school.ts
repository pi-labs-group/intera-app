/**
 * Tipos do domínio escolar entregues às telas. Espelham, de forma simplificada,
 * os modelos do schema Prisma (Diary, Enrollment, AssessmentType e
 * DiaryAssessment); os serviços fazem a conversão.
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

/**
 * Trabalho cadastrado pelo professor, com nota própria (AssignmentGrade). A
 * consolidação das notas de trabalho na avaliação TRAB está pendente (D3).
 */
export type Assignment = {
  id: string;
  bimester: Bimester;
  title: string;
  /** Data no formato ISO (AAAA-MM-DD). */
  dueDate: string;
  description: string;
  maxGrade: number;
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

/** Número da aula no dia (1 a 6): dias com duas aulas da disciplina têm 1 e 2. */
export type LessonNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type Teacher = {
  name: string;
  /** Forma de tratamento exibida (ex.: "Prof. Renato"). */
  displayName: string;
  subject: string;
};
