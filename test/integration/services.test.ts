import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { integrationEnabled, resetTestDatabase } from "./setup";

const session = vi.hoisted(() => ({
  role: "teacher" as "teacher" | "student" | "guardian" | "secretary",
}));

vi.mock("@/server/services/auth-service", () => ({
  requireRole: vi.fn(async (allowed: string[]) => {
    if (!allowed.includes(session.role))
      throw new Error("Perfil não permitido.");
    return { role: session.role };
  }),
}));

describe.skipIf(!integrationEnabled)("serviços com o banco", async () => {
  const { db } = await import("@/server/db/prisma");
  const { seedIds } = await import("./helpers");
  const teacherService = await import("@/server/services/teacher-service");
  const studentService = await import("@/server/services/student-service");
  const secretaryService = await import("@/server/services/secretary-service");
  const writeService = await import("@/server/services/grade-write-service");
  let ids: Awaited<ReturnType<typeof seedIds>>;

  beforeAll(async () => {
    await resetTestDatabase();
    ids = await seedIds();
  });

  beforeEach(() => {
    session.role = "teacher";
    vi.useRealTimers();
  });

  describe("leitura", () => {
    it("o professor não vê matrícula transferida", async () => {
      const transferred = ids.diary9a.schoolClass.enrollments[0]!;
      await db().enrollment.update({
        where: { id: transferred.id },
        data: { status: "transferred" },
      });
      const diaries = await teacherService.getTeacherDiaries();
      const nine = diaries.find((diary) => diary.id === ids.diary9a.id)!;
      expect(
        nine.students.some(
          (student) => student.enrollmentId === transferred.id,
        ),
      ).toBe(false);

      session.role = "secretary";
      const overview = await secretaryService.getSecretaryOverview();
      // Seed: 7 alunos no 9º A + 5 no 8º A; 1 transferido sai da contagem.
      expect(
        overview.userGroups.find((group) => group.label === "Alunos")?.count,
      ).toBe(11);

      await db().enrollment.update({
        where: { id: transferred.id },
        data: { status: "active" },
      });
    });

    it("o responsável vê os dados do Lucas, com a média da turma", async () => {
      session.role = "guardian";
      const performance = await studentService.getStudentPerformance();
      expect(performance.studentName).toBe("Lucas Andrade");
      const p1 = performance.subjects
        .find((subject) => subject.subject === "Matemática")
        ?.bimesters.find((bimester) => bimester.bimester === 4)
        ?.assessments.find((item) => item.id === ids.p1Id);
      expect(p1?.value).toBe(4.5);
      // 7,5 + 6 + 9 + 8,5 + 7 + 4,5 = 42,5 em 6 notas: 7,0833…, exibida 7,1.
      expect(p1?.comparison).toEqual({
        status: "shown",
        studentValue: 4.5,
        classAverage: 7.1,
        sampleSize: 6,
        difference: -2.6,
        position: "below",
      });
    });

    it("privacidade: só agregados e nenhuma matrícula de colega", async () => {
      session.role = "student";
      const json = JSON.stringify(await studentService.getStudentPerformance());
      for (const enrollment of ids.diary9a.schoolClass.enrollments) {
        expect(json).not.toContain(enrollment.id);
      }
      // Notas individuais dos colegas na P1 (7,5; 6; 9; 8,5; 7) não aparecem.
      expect(json).not.toMatch(/"value":(7\.5|6|9|8\.5|7)[,}]/);
    });
  });

  describe("escrita", () => {
    const enrollment = (index: number) =>
      ids.diary9a.schoolClass.enrollments[index]!.id;

    it("salva no próprio diário e apaga a nota esvaziada", async () => {
      await writeService.saveAssessmentGrades({
        diaryId: ids.diary9a.id,
        bimester: 3,
        assessmentTypeId: ids.p1Id,
        grades: [{ enrollmentId: enrollment(0), raw: "8,25" }],
      });
      const where = {
        enrollmentId: enrollment(0),
        diaryId: ids.diary9a.id,
        bimester: 3,
        assessmentTypeId: ids.p1Id,
      };
      expect((await db().grade.findFirst({ where }))?.value.toNumber()).toBe(
        8.25,
      );
      await writeService.saveAssessmentGrades({
        diaryId: ids.diary9a.id,
        bimester: 3,
        assessmentTypeId: ids.p1Id,
        grades: [{ enrollmentId: enrollment(0), raw: "" }],
      });
      expect(await db().grade.findFirst({ where })).toBeNull();
    });

    it("recusa diário de outro professor", async () => {
      const otherUser = await db().user.create({
        data: {
          email: "outro@interacao.com.br",
          name: "Outro",
          role: "teacher",
        },
      });
      const other = await db().teacher.create({
        data: { userId: otherUser.id, displayName: "Prof. Outro" },
      });
      await db().diary.update({
        where: { id: ids.diary8a.id },
        data: { teacherId: other.id },
      });
      await expect(
        writeService.saveAssessmentGrades({
          diaryId: ids.diary8a.id,
          bimester: 4,
          assessmentTypeId: ids.p1Id,
          grades: [],
        }),
      ).rejects.toThrow("Diário não encontrado entre os seus.");
      await db().diary.update({
        where: { id: ids.diary8a.id },
        data: { teacherId: ids.diary9a.teacherId },
      });
    });

    it("recusa matrícula de outra turma antes do trigger", async () => {
      await expect(
        writeService.saveAssessmentGrades({
          diaryId: ids.diary9a.id,
          bimester: 4,
          assessmentTypeId: ids.p1Id,
          grades: [
            {
              enrollmentId: ids.diary8a.schoolClass.enrollments[0]!.id,
              raw: "7",
            },
          ],
        }),
      ).rejects.toThrow(/não está matriculado/);
    });

    it("recusa tipo não declarado e nota acima da máxima", async () => {
      await expect(
        writeService.saveAssessmentGrades({
          diaryId: ids.diary9a.id,
          bimester: 4,
          assessmentTypeId: ids.recId,
          grades: [],
        }),
      ).rejects.toThrow("Avaliação não declarada neste diário.");
      await expect(
        writeService.saveAssessmentGrades({
          diaryId: ids.diary9a.id,
          bimester: 4,
          assessmentTypeId: ids.p1Id,
          grades: [{ enrollmentId: enrollment(0), raw: "10,5" }],
        }),
      ).rejects.toThrow(/nota inválida/);
    });

    it("chamada: recusa data futura ou fora dos bimestres; aceita duas aulas", async () => {
      vi.useFakeTimers({
        now: new Date("2026-11-02T15:00:00Z"),
        toFake: ["Date"],
      });
      const base = {
        diaryId: ids.diary9a.id,
        absentEnrollmentIds: [enrollment(1)],
      };
      await expect(
        writeService.saveAttendance({
          ...base,
          date: "2026-11-03",
          lessonNumber: 1,
        }),
      ).rejects.toThrow(/data futura/);
      await expect(
        writeService.saveAttendance({
          ...base,
          date: "2026-07-20",
          lessonNumber: 1,
        }),
      ).rejects.toThrow(/nenhum bimestre/);

      await writeService.saveAttendance({
        ...base,
        date: "2026-10-08",
        lessonNumber: 1,
      });
      await writeService.saveAttendance({
        ...base,
        date: "2026-10-08",
        lessonNumber: 2,
      });
      expect(
        await db().attendance.count({
          where: {
            enrollmentId: enrollment(1),
            date: new Date("2026-10-08T00:00:00Z"),
          },
        }),
      ).toBe(2);
    });
  });
});
