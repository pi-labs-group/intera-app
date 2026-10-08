import "server-only";

import type { Diary, Teacher } from "@/types/school";
import { requireRole } from "./auth-service";

/**
 * Leitura dos diários do professor. Por enquanto devolve dados mockados; na fase E
 * passa a consultar DiarioRepository/MatriculaRepository (Seção 8.2). Cada função
 * verifica a sessão, pois os dados dos alunos só podem chegar ao professor.
 */

// TODO (fase E): substituir por dados reais
const TEACHER: Teacher = {
  name: "Renato Lima",
  displayName: "Prof. Renato",
  subject: "Matemática",
};

// Avaliações do diário: o catálogo varia por disciplina (AvaliacaoDoDiario).
const MATH_ASSESSMENTS: Diary["assessments"] = [
  { id: "p1", code: "P1", name: "Prova 1", maxGrade: 10 },
  { id: "p2", code: "P2", name: "Prova 2", maxGrade: 10 },
  { id: "sim", code: "SIM", name: "Simulado", maxGrade: 10 },
  { id: "part", code: "PART", name: "Participação", maxGrade: 10 },
];

// TODO (fase E): substituir por dados reais
const DIARIES: Diary[] = [
  {
    id: "mat-9a",
    subject: "Matemática",
    subjectIcon: "calculate",
    className: "9º A",
    assessments: MATH_ASSESSMENTS,
    students: [
      { enrollmentId: "m-9a-01", callNumber: 1, name: "Ana Souza" },
      { enrollmentId: "m-9a-02", callNumber: 2, name: "Bruno Alves" },
      { enrollmentId: "m-9a-03", callNumber: 3, name: "Carla Dias" },
      { enrollmentId: "m-9a-04", callNumber: 4, name: "Diego Farias" },
      { enrollmentId: "m-9a-05", callNumber: 5, name: "Elisa Gomes" },
      { enrollmentId: "m-9a-06", callNumber: 6, name: "Felipe Melo" },
      { enrollmentId: "m-9a-07", callNumber: 7, name: "Lucas Andrade" },
    ],
    assignments: [
      {
        id: "trab-9a-1",
        title: "Frações no cotidiano",
        dueDate: "2026-10-20",
        description: "Pesquisa em dupla com exemplos de frações em receitas.",
      },
    ],
  },
  {
    id: "mat-8a",
    subject: "Matemática",
    subjectIcon: "calculate",
    className: "8º A",
    assessments: MATH_ASSESSMENTS,
    students: [
      { enrollmentId: "m-8a-01", callNumber: 1, name: "Gabriela Nunes" },
      { enrollmentId: "m-8a-02", callNumber: 2, name: "Henrique Prado" },
      { enrollmentId: "m-8a-03", callNumber: 3, name: "Isabela Rocha" },
      { enrollmentId: "m-8a-04", callNumber: 4, name: "João Pedro Lima" },
      { enrollmentId: "m-8a-05", callNumber: 5, name: "Larissa Teixeira" },
    ],
    assignments: [],
  },
];

export async function getCurrentTeacher(): Promise<Teacher> {
  await requireRole(["teacher"]);
  return TEACHER;
}

/** Diários (turma + disciplina) atribuídos ao professor no ano letivo atual. */
export async function getTeacherDiaries(): Promise<Diary[]> {
  await requireRole(["teacher"]);
  return DIARIES;
}
