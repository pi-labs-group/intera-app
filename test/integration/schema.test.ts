import { beforeAll, describe, expect, it } from "vitest";
import { integrationEnabled, resetTestDatabase, runSeed } from "./setup";

describe.skipIf(!integrationEnabled)("constraints do schema", async () => {
  const { db } = await import("@/server/db/prisma");
  const { seedIds } = await import("./helpers");
  let ids: Awaited<ReturnType<typeof seedIds>>;

  beforeAll(async () => {
    await resetTestDatabase();
    ids = await seedIds();
  });

  function enrollmentOf(diary: typeof ids.diary9a, index = 0) {
    const enrollment = diary.schoolClass.enrollments[index];
    if (!enrollment) throw new Error("Matrícula ausente no seed.");
    return enrollment.id;
  }

  it("recusa nota de matrícula do 8º A no diário do 9º A (trigger)", async () => {
    await expect(
      db().grade.create({
        data: {
          enrollmentId: enrollmentOf(ids.diary8a),
          diaryId: ids.diary9a.id,
          bimester: 1,
          assessmentTypeId: ids.p1Id,
          value: 5,
        },
      }),
    ).rejects.toThrow(/não pertence à turma/);
  });

  it("recusa nota de avaliação não declarada no diário (FK)", async () => {
    await expect(
      db().grade.create({
        data: {
          enrollmentId: enrollmentOf(ids.diary9a),
          diaryId: ids.diary9a.id,
          bimester: 1,
          assessmentTypeId: ids.recId,
          value: 5,
        },
      }),
    ).rejects.toThrow();
  });

  it("recusa bimestre 5 (CHECK)", async () => {
    await expect(
      db().grade.create({
        data: {
          enrollmentId: enrollmentOf(ids.diary9a),
          diaryId: ids.diary9a.id,
          bimester: 5,
          assessmentTypeId: ids.p1Id,
          value: 5,
        },
      }),
    ).rejects.toThrow();
  });

  it("recusa presença com falta compensada (CHECK)", async () => {
    await expect(
      db().attendance.create({
        data: {
          enrollmentId: enrollmentOf(ids.diary9a),
          diaryId: ids.diary9a.id,
          date: new Date("2026-10-06T00:00:00Z"),
          present: true,
          compensated: true,
        },
      }),
    ).rejects.toThrow();
  });

  it("aceita duas aulas na mesma data", async () => {
    const base = {
      enrollmentId: enrollmentOf(ids.diary9a),
      diaryId: ids.diary9a.id,
      date: new Date("2026-10-07T00:00:00Z"),
      present: false,
    };
    await db().attendance.create({ data: { ...base, lessonNumber: 1 } });
    await db().attendance.create({ data: { ...base, lessonNumber: 2 } });
    expect(
      await db().attendance.count({
        where: { diaryId: base.diaryId, date: base.date },
      }),
    ).toBe(2);
  });

  it("recusa dois anos letivos atuais (índice parcial)", async () => {
    await expect(
      db().schoolYear.create({ data: { year: 2027, isCurrent: true } }),
    ).rejects.toThrow();
  });

  it("o seed é idempotente", async () => {
    const count = () =>
      Promise.all([
        db().student.count(),
        db().enrollment.count(),
        db().grade.count(),
        db().assignment.count(),
        db().assignmentGrade.count(),
        db().schoolPeriod.count(),
      ]);
    const before = await count();
    runSeed();
    expect(await count()).toEqual(before);
  });
});
