import { db } from "@/server/db/prisma";

/** Ids do seed usados pelos testes de integração. */
export async function seedIds() {
  const [p1, rec, mathDiaries, lucas] = await Promise.all([
    db().assessmentType.findUniqueOrThrow({ where: { code: "P1" } }),
    db().assessmentType.findUniqueOrThrow({ where: { code: "REC" } }),
    db().diary.findMany({
      where: { subject: { code: "00012" } },
      include: {
        schoolClass: {
          include: { enrollments: { orderBy: { callNumber: "asc" } } },
        },
      },
    }),
    db().student.findUniqueOrThrow({
      where: { registrationNumber: "20230045" },
    }),
  ]);
  const byGrade = (gradeLevel: string) => {
    const diary = mathDiaries.find(
      (item) => item.schoolClass.gradeLevel === gradeLevel,
    );
    if (!diary) throw new Error(`Diário de ${gradeLevel} não está no seed.`);
    return diary;
  };
  return {
    p1Id: p1.id,
    recId: rec.id,
    diary9a: byGrade("9º"),
    diary8a: byGrade("8º"),
    lucasId: lucas.id,
  };
}
