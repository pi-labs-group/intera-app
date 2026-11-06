import { beforeEach, describe, expect, it, vi } from "vitest";
import { decimal } from "../../../test/stubs/decimal";

const session = vi.hoisted(() => ({
  role: "student" as "student" | "guardian",
}));

vi.mock("@/server/services/auth-service", () => ({
  requireRole: vi.fn(async () => ({ role: session.role })),
}));
vi.mock("@/server/repositories/student-repository", () => ({
  findStudentByEmail: vi.fn(async () => LUCAS),
  findFirstStudentOfGuardian: vi.fn(async () => LUCAS),
  findActiveEnrollment: vi.fn(async () => ({
    id: "enr-lucas",
    schoolClassId: "class-9a",
    schoolClass: { gradeLevel: "9º", name: "A" },
  })),
}));
vi.mock("@/server/repositories/school-calendar-repository", () => ({
  findCurrentSchoolYear: vi.fn(async () => ({ id: 1, year: 2026 })),
  listPeriods: vi.fn(async () => []),
}));
vi.mock("@/server/repositories/school-repository", () => ({
  listClassIdentities: vi.fn(async () => [
    { id: "class-9a", gradeLevel: "9º", name: "A", shift: "Manhã" },
  ]),
}));
vi.mock("@/server/repositories/diary-repository", () => ({
  listDiariesByClass: vi.fn(async () => [
    {
      id: "diary-math",
      subject: { name: "Matemática", code: "00012", icon: "calculate" },
      assessments: [
        { assessmentTypeId: "type-p1", assessmentType: { name: "Prova 1" } },
        { assessmentTypeId: "type-p2", assessmentType: { name: "Prova 2" } },
      ],
      assignments: [
        { id: "assignment-1", bimester: 4, title: "Frações no cotidiano" },
      ],
    },
  ]),
}));
vi.mock("@/server/repositories/grade-repository", () => ({
  listByEnrollment: vi.fn(async () => [
    {
      diaryId: "diary-math",
      bimester: 4,
      assessmentTypeId: "type-p1",
      value: decimal(4.5),
    },
  ]),
  aggregateByDiaries: vi.fn(async () => [
    {
      diaryId: "diary-math",
      bimester: 4,
      assessmentTypeId: "type-p1",
      _avg: { value: decimal(42.5 / 6) },
      _count: { _all: 6 },
    },
  ]),
  listBimesterAveragesByEnrollment: vi.fn(async () => []),
  aggregateBimesterAverages: vi.fn(async () => []),
}));
vi.mock("@/server/repositories/assignment-repository", () => ({
  listAssignmentGradesByEnrollment: vi.fn(async () => [
    { assignmentId: "assignment-1", value: decimal(6) },
  ]),
  // Só 3 notas no trabalho: abaixo do mínimo (D5).
  aggregateAssignmentGrades: vi.fn(async () => [
    {
      assignmentId: "assignment-1",
      _avg: { value: decimal(8.3333) },
      _count: { _all: 3 },
    },
  ]),
}));
vi.mock("@/server/repositories/attendance-repository", () => ({
  countAbsencesByEnrollment: vi.fn(async () => [
    { diaryId: "diary-math", _count: { _all: 2 } },
  ]),
}));

const LUCAS = vi.hoisted(() => ({
  id: "student-lucas",
  name: "Lucas Andrade",
  registrationNumber: "20230045",
}));

const repositories = {
  student: await import("@/server/repositories/student-repository"),
  grade: await import("@/server/repositories/grade-repository"),
};
const { getStudentPerformance } = await import("./student-service");

beforeEach(() => {
  session.role = "student";
  vi.clearAllMocks();
});

describe("getStudentPerformance", () => {
  it("monta as notas do aluno com a comparação com a turma", async () => {
    const performance = await getStudentPerformance();
    expect(performance.studentName).toBe("Lucas Andrade");
    expect(performance.className).toBe("9º A");

    const [math] = performance.subjects;
    expect(math).toMatchObject({
      subject: "Matemática",
      absences: 2,
      bimesters: [
        {
          bimester: 4,
          average: null,
          assessments: [
            {
              id: "type-p1",
              label: "Prova 1",
              value: 4.5,
              comparison: {
                status: "shown",
                classAverage: 7.1,
                sampleSize: 6,
                difference: -2.6,
                position: "below",
              },
            },
          ],
          assignments: [
            {
              id: "assignment-1",
              value: 6,
              comparison: { status: "hidden", reason: "insufficient-sample" },
            },
          ],
        },
      ],
    });
    // P2 sem nota do aluno não aparece; bimestres sem nota também não.
    expect(math?.bimesters).toHaveLength(1);
    expect(math?.bimesters[0]?.assessments).toHaveLength(1);
  });

  it("lê só as notas da matrícula do próprio aluno", async () => {
    await getStudentPerformance();
    expect(repositories.grade.listByEnrollment).toHaveBeenCalledWith(
      "enr-lucas",
    );
  });

  it("não expõe matrícula nem a média de amostra pequena", async () => {
    const json = JSON.stringify(await getStudentPerformance());
    expect(json).not.toContain("enr-");
    // Média do trabalho (8,33 com 3 notas) fica oculta.
    expect(json).not.toContain("8.3");
  });

  it("responsável vê o aluno vinculado", async () => {
    session.role = "guardian";
    const performance = await getStudentPerformance();
    expect(repositories.student.findFirstStudentOfGuardian).toHaveBeenCalled();
    expect(performance.studentName).toBe("Lucas Andrade");
  });

  it("sem matrícula ativa no ano, não lista matérias", async () => {
    vi.mocked(repositories.student.findActiveEnrollment).mockResolvedValueOnce(
      null,
    );
    expect(await getStudentPerformance()).toEqual({
      studentName: "Lucas Andrade",
      className: null,
      subjects: [],
    });
  });
});
