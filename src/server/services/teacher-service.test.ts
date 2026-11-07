import { beforeEach, describe, expect, it, vi } from "vitest";
import { decimal } from "../../../test/stubs/decimal";

vi.mock("@/server/services/auth-service", () => ({
  requireRole: vi.fn(async () => ({ role: "teacher" })),
}));
vi.mock("@/server/repositories/teacher-repository", () => ({
  findTeacherByEmail: vi.fn(async () => ({
    id: "teacher-1",
    displayName: "Prof. Renato",
    user: { name: "Renato Lima" },
  })),
}));
vi.mock("@/server/repositories/school-calendar-repository", () => ({
  findCurrentSchoolYear: vi.fn(async () => ({ id: 1, year: 2026 })),
  listPeriods: vi.fn(async () => []),
}));
vi.mock("@/server/repositories/school-repository", () => ({
  listClassIdentities: vi.fn(async () => [
    { id: "class-8a-m", gradeLevel: "8º", name: "A", shift: "Manhã" },
    { id: "class-8a-t", gradeLevel: "8º", name: "A", shift: "Tarde" },
  ]),
}));
vi.mock("@/server/repositories/diary-repository", () => ({
  listDiariesByTeacher: vi.fn(),
}));
vi.mock("@/server/repositories/grade-repository", () => ({
  listByDiaries: vi.fn(async () => []),
}));
vi.mock("@/server/repositories/attendance-repository", () => ({
  listAbsencesByDiaries: vi.fn(async () => [
    {
      diaryId: "diary-1",
      date: new Date("2026-10-06T00:00:00Z"),
      lessonNumber: 2,
      enrollmentId: "enr-1",
    },
  ]),
}));

const { listDiariesByTeacher } =
  await import("@/server/repositories/diary-repository");
const service = await import("./teacher-service");

const DIARY = {
  id: "diary-1",
  subject: { name: "Matemática", code: "00012", icon: "calculate" },
  schoolClass: {
    id: "class-8a-m",
    gradeLevel: "8º",
    name: "A",
    shift: "Manhã",
    enrollments: [
      { id: "enr-1", callNumber: 1, student: { name: "Gabriela Nunes" } },
    ],
  },
  assessments: [
    {
      assessmentTypeId: "type-p1",
      maxGrade: null,
      assessmentType: { code: "P1", name: "Prova 1" },
    },
    {
      assessmentTypeId: "type-trab",
      maxGrade: decimal(10),
      assessmentType: { code: "TRAB", name: "Trabalho" },
    },
  ],
  assignments: [
    {
      id: "assignment-1",
      bimester: 4,
      title: "Frações",
      dueDate: new Date("2026-10-20T00:00:00Z"),
      description: "",
      maxGrade: decimal(5),
      grades: [{ enrollmentId: "enr-1", value: decimal(4.5) }],
    },
  ],
};

beforeEach(() => {
  vi.mocked(listDiariesByTeacher).mockResolvedValue([DIARY] as never);
});

describe("getTeacherDiaries", () => {
  it("converte o diário do banco para a tela", async () => {
    const [diary] = await service.getTeacherDiaries();
    expect(diary).toEqual({
      id: "diary-1",
      subject: "Matemática",
      subjectIcon: "calculate",
      // Há outro 8º A (tarde) no ano: o rótulo leva o turno.
      className: "8º A · Manhã",
      students: [
        { enrollmentId: "enr-1", callNumber: 1, name: "Gabriela Nunes" },
      ],
      // TRAB fica fora: é gerido na aba Trabalhos (D3). Sem máximo, vale 10.
      assessments: [
        { id: "type-p1", code: "P1", name: "Prova 1", maxGrade: 10 },
      ],
      assignments: [
        {
          id: "assignment-1",
          bimester: 4,
          title: "Frações",
          dueDate: "2026-10-20",
          description: "",
          maxGrade: 5,
        },
      ],
    });
  });

  it("filtra pelo ano letivo atual", async () => {
    await service.getTeacherDiaries();
    expect(listDiariesByTeacher).toHaveBeenCalledWith("teacher-1", 1);
  });
});

describe("getCurrentTeacher", () => {
  it("lista as matérias dos diários", async () => {
    expect((await service.getCurrentTeacher()).subject).toBe("Matemática");
  });

  it("sem diários, mostra um traço em vez de texto vazio", async () => {
    vi.mocked(listDiariesByTeacher).mockResolvedValue([]);
    expect((await service.getCurrentTeacher()).subject).toBe("—");
  });
});

describe("chaves do editor", () => {
  it("notas de trabalho por assignmentGradeKey, sem bimestre", async () => {
    expect(await service.getTeacherAssignmentGrades()).toEqual({
      "assignment-1|enr-1": "4,5",
    });
  });

  it("faltas por diário, data e aula", async () => {
    expect(await service.getTeacherAbsences()).toEqual({
      "diary-1|2026-10-06|2": ["enr-1"],
    });
  });
});
