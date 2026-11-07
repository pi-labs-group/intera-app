import { beforeEach, describe, expect, it, vi } from "vitest";
import { decimal } from "../../../test/stubs/decimal";

vi.mock("@/server/db/prisma", () => ({
  db: () => ({
    $transaction: (work: (tx: object) => unknown) => work({}),
  }),
}));
vi.mock("@/server/services/teacher-service", () => ({
  findSessionTeacher: vi.fn(async () => ({ id: "teacher-1" })),
}));
vi.mock("@/server/repositories/diary-repository", () => ({
  findDiaryForWrite: vi.fn(),
}));
vi.mock("@/server/repositories/enrollment-repository", () => ({
  listActiveEnrollmentIds: vi.fn(async () => new Set(["enr-1", "enr-2"])),
}));
vi.mock("@/server/repositories/grade-repository", () => ({
  upsertGrade: vi.fn(),
  deleteGrade: vi.fn(async () => 1),
}));
vi.mock("@/server/repositories/assignment-repository", () => ({
  createAssignment: vi.fn(),
  findAssignmentForWrite: vi.fn(),
  upsertAssignmentGrade: vi.fn(),
  deleteAssignmentGrade: vi.fn(async () => 0),
}));
vi.mock("@/server/repositories/attendance-repository", () => ({
  upsertAttendance: vi.fn(),
}));
vi.mock("@/server/repositories/school-calendar-repository", () => ({
  listPeriods: vi.fn(async () => [
    {
      bimester: 4,
      startDate: new Date("2026-10-05T00:00:00Z"),
      endDate: new Date("2026-12-18T00:00:00Z"),
    },
  ]),
}));

const { findDiaryForWrite } =
  await import("@/server/repositories/diary-repository");
const grades = await import("@/server/repositories/grade-repository");
const assignments = await import("@/server/repositories/assignment-repository");
const { upsertAttendance } =
  await import("@/server/repositories/attendance-repository");
const service = await import("./grade-write-service");

function diary(overrides: { teacherId?: string; isCurrent?: boolean } = {}) {
  return {
    id: "diary-1",
    teacherId: overrides.teacherId ?? "teacher-1",
    schoolClassId: "class-1",
    schoolClass: {
      schoolYearId: 1,
      schoolYear: { isCurrent: overrides.isCurrent ?? true },
    },
    assessments: [
      {
        assessmentTypeId: "type-p1",
        maxGrade: null,
        assessmentType: { code: "P1" },
      },
      {
        assessmentTypeId: "type-trab",
        maxGrade: decimal(10),
        assessmentType: { code: "TRAB" },
      },
    ],
  };
}

const P1_INPUT = {
  diaryId: "diary-1",
  bimester: 4,
  assessmentTypeId: "type-p1",
  grades: [
    { enrollmentId: "enr-1", raw: "7,5" },
    { enrollmentId: "enr-2", raw: "" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(findDiaryForWrite).mockResolvedValue(diary() as never);
  vi.useRealTimers();
});

describe("saveAssessmentGrades", () => {
  it("grava no próprio diário e apaga a nota esvaziada (D6)", async () => {
    await expect(service.saveAssessmentGrades(P1_INPUT)).resolves.toEqual({
      saved: 1,
      deleted: 1,
    });
    expect(grades.upsertGrade).toHaveBeenCalledWith(
      {},
      {
        enrollmentId: "enr-1",
        diaryId: "diary-1",
        bimester: 4,
        assessmentTypeId: "type-p1",
      },
      7.5,
    );
    expect(grades.deleteGrade).toHaveBeenCalledTimes(1);
  });

  it("recusa diário de outro professor", async () => {
    vi.mocked(findDiaryForWrite).mockResolvedValue(
      diary({ teacherId: "teacher-2" }) as never,
    );
    await expect(service.saveAssessmentGrades(P1_INPUT)).rejects.toThrow(
      "Diário não encontrado entre os seus.",
    );
    expect(grades.upsertGrade).not.toHaveBeenCalled();
  });

  it("recusa diário de ano letivo que não é o atual", async () => {
    vi.mocked(findDiaryForWrite).mockResolvedValue(
      diary({ isCurrent: false }) as never,
    );
    await expect(service.saveAssessmentGrades(P1_INPUT)).rejects.toThrow(
      /ano letivo atual/,
    );
  });

  it("recusa o lote inteiro com matrícula de fora da turma", async () => {
    await expect(
      service.saveAssessmentGrades({
        ...P1_INPUT,
        grades: [
          { enrollmentId: "enr-1", raw: "8" },
          { enrollmentId: "enr-outra-turma", raw: "9" },
        ],
      }),
    ).rejects.toThrow(/não está matriculado/);
    expect(grades.upsertGrade).not.toHaveBeenCalled();
  });

  it.each(["type-rec", "type-trab"])(
    "recusa avaliação %s (não declarada ou TRAB)",
    async (assessmentTypeId) => {
      await expect(
        service.saveAssessmentGrades({ ...P1_INPUT, assessmentTypeId }),
      ).rejects.toThrow("Avaliação não declarada neste diário.");
    },
  );

  it("recusa 10,5 com máximo 10, com o erro na matrícula", async () => {
    const error = await service
      .saveAssessmentGrades({
        ...P1_INPUT,
        grades: [{ enrollmentId: "enr-1", raw: "10,5" }],
      })
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(service.GradeWriteError);
    expect(
      (error as InstanceType<typeof service.GradeWriteError>).fieldErrors,
    ).toEqual({ "enr-1": "A nota máxima é 10." });
    expect(grades.upsertGrade).not.toHaveBeenCalled();
  });

  it("recusa bimestre 5 e aluno repetido na validação de entrada", async () => {
    await expect(
      service.saveAssessmentGrades({ ...P1_INPUT, bimester: 5 }),
    ).rejects.toThrow("Revise os dados informados.");
    await expect(
      service.saveAssessmentGrades({
        ...P1_INPUT,
        grades: [
          { enrollmentId: "enr-1", raw: "7" },
          { enrollmentId: "enr-1", raw: "8" },
        ],
      }),
    ).rejects.toThrow("Revise os dados informados.");
  });
});

describe("saveAssignmentGrades", () => {
  it("usa a nota máxima do trabalho", async () => {
    vi.mocked(assignments.findAssignmentForWrite).mockResolvedValue({
      id: "assignment-1",
      diaryId: "diary-1",
      maxGrade: decimal(5),
    } as never);
    await expect(
      service.saveAssignmentGrades({
        assignmentId: "assignment-1",
        grades: [{ enrollmentId: "enr-1", raw: "6" }],
      }),
    ).rejects.toThrow(/nota inválida/);
    await expect(
      service.saveAssignmentGrades({
        assignmentId: "assignment-1",
        grades: [{ enrollmentId: "enr-1", raw: "4,5" }],
      }),
    ).resolves.toEqual({ saved: 1, deleted: 0 });
  });
});

describe("saveAttendance", () => {
  const INPUT = {
    diaryId: "diary-1",
    date: "2026-10-06",
    lessonNumber: 2,
    absentEnrollmentIds: ["enr-2"],
  };

  it("grava uma linha por aluno ativo, com a data em UTC", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T15:00:00Z") });
    await expect(service.saveAttendance(INPUT)).resolves.toEqual({
      present: 1,
      absent: 1,
    });
    const key = {
      diaryId: "diary-1",
      date: new Date("2026-10-06T00:00:00Z"),
      lessonNumber: 2,
    };
    expect(upsertAttendance).toHaveBeenCalledWith(
      {},
      { ...key, enrollmentId: "enr-1" },
      true,
    );
    expect(upsertAttendance).toHaveBeenCalledWith(
      {},
      { ...key, enrollmentId: "enr-2" },
      false,
    );
  });

  it("recusa data futura", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-05T15:00:00Z") });
    await expect(service.saveAttendance(INPUT)).rejects.toThrow(/data futura/);
  });

  it("recusa data fora dos bimestres", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T15:00:00Z") });
    await expect(
      service.saveAttendance({ ...INPUT, date: "2026-10-02" }),
    ).rejects.toThrow(/nenhum bimestre/);
  });
});
