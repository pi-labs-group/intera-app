/**
 * Seed de desenvolvimento: reproduz no banco os dados que as telas exibiam como
 * mock (usuários demo de src/lib/roles.ts, turmas, disciplinas e tipos de
 * avaliação da secretaria e os diários de Matemática do Prof. Renato).
 *
 * Pode rodar várias vezes: cada registro é localizado por uma chave natural
 * (e-mail, código, turma + nº de chamada...) e só é criado se ainda não existir;
 * os já existentes são atualizados para o estado descrito aqui.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ROLES } from "../src/lib/roles";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SCHOOL_YEAR = 2026;

// sortOrder: EF pela série; EM depois do EF.
const CLASSES = [
  {
    gradeLevel: "8º",
    name: "A",
    shift: "Manhã",
    educationLevel: "EF",
    sortOrder: 8,
  },
  {
    gradeLevel: "8º",
    name: "B",
    shift: "Tarde",
    educationLevel: "EF",
    sortOrder: 8,
  },
  {
    gradeLevel: "9º",
    name: "A",
    shift: "Manhã",
    educationLevel: "EF",
    sortOrder: 9,
  },
  {
    gradeLevel: "1ª série",
    name: "A",
    shift: "Manhã",
    educationLevel: "EM",
    sortOrder: 10,
  },
];

// FICTÍCIO (D4): substituir pelo calendário da escola.
const SCHOOL_PERIODS = [
  { bimester: 1, startDate: "2026-02-02", endDate: "2026-04-17" },
  { bimester: 2, startDate: "2026-04-20", endDate: "2026-07-03" },
  { bimester: 3, startDate: "2026-08-03", endDate: "2026-10-02" },
  { bimester: 4, startDate: "2026-10-05", endDate: "2026-12-18" },
];

const SUBJECTS = [
  { code: "00012", name: "Matemática", icon: "calculate" },
  { code: "00013", name: "Língua Portuguesa", icon: "menu_book" },
  { code: "00021", name: "Ciências", icon: "science" },
  { code: "00031", name: "História", icon: "history_edu" },
  { code: "00032", name: "Geografia", icon: "public" },
  { code: "00041", name: "Educação Física", icon: "sports_soccer" },
];

const ASSESSMENT_TYPES = [
  { code: "P1", name: "Prova 1" },
  { code: "P2", name: "Prova 2" },
  { code: "SIM", name: "Simulado" },
  { code: "TRAB", name: "Trabalho" },
  { code: "PART", name: "Participação" },
  { code: "REC", name: "Recuperação" },
];

// Avaliações declaradas pelos diários de Matemática, na ordem de exibição.
const MATH_ASSESSMENT_CODES = ["P1", "P2", "SIM", "PART"];

const LUCAS = {
  name: "Lucas Andrade",
  registrationNumber: "20230045",
  photoUrl:
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
};

type SeedAssignment = {
  title: string;
  bimester: number;
  dueDate: string;
  description: string;
  /** Notas por nº de chamada. */
  grades: Record<number, number>;
};

const DIARIES: {
  gradeLevel: string;
  students: string[];
  assignments: SeedAssignment[];
  /** Notas de P1 do 4º bimestre, por nº de chamada. */
  p1Grades: Record<number, number>;
}[] = [
  {
    gradeLevel: "9º",
    students: [
      "Ana Souza",
      "Bruno Alves",
      "Carla Dias",
      "Diego Farias",
      "Elisa Gomes",
      "Felipe Melo",
      LUCAS.name,
    ],
    assignments: [
      {
        title: "Frações no cotidiano",
        bimester: 4,
        dueDate: "2026-10-20",
        description: "Pesquisa em dupla com exemplos de frações em receitas.",
        grades: { 1: 8.0, 2: 7.5, 3: 9.0 },
      },
    ],
    // O nº 4 ainda não tem nota.
    p1Grades: { 1: 7.5, 2: 6.0, 3: 9.0, 5: 8.5, 6: 7.0, 7: 4.5 },
  },
  {
    gradeLevel: "8º",
    students: [
      "Gabriela Nunes",
      "Henrique Prado",
      "Isabela Rocha",
      "João Pedro Lima",
      "Larissa Teixeira",
    ],
    assignments: [],
    p1Grades: {},
  },
];

const P1_BIMESTER = 4;

/** Data AAAA-MM-DD como DATE, sem deslocamento de fuso. */
function isoDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

async function upsertUser(
  email: string,
  name: string,
  role: keyof typeof ROLES,
) {
  return prisma.user.upsert({
    where: { email },
    create: { email, name, role },
    update: { name, role },
  });
}

/**
 * Matrícula de um nº de chamada, ligada ao aluno certo. Na reexecução: o Lucas
 * é religado pelo id; para os demais, se o nome mudou, o aluno criado pelo seed
 * (sem RA) é renomeado, e um aluno com RA nunca é renomeado (ganha-se um aluno
 * novo para o nº de chamada).
 */
async function upsertEnrollment(
  schoolClassId: string,
  callNumber: number,
  name: string,
  lucasId: string,
) {
  const existing = await prisma.enrollment.findUnique({
    where: { schoolClassId_callNumber: { schoolClassId, callNumber } },
    include: { student: true },
  });

  if (!existing) {
    return prisma.enrollment.create({
      data: {
        schoolClass: { connect: { id: schoolClassId } },
        callNumber,
        student:
          name === LUCAS.name
            ? { connect: { id: lucasId } }
            : { create: { name } },
      },
    });
  }

  if (name === LUCAS.name) {
    return prisma.enrollment.update({
      where: { id: existing.id },
      data: { studentId: lucasId, status: "active", leftAt: null },
    });
  }
  if (existing.student.name !== name) {
    if (existing.student.registrationNumber === null) {
      await prisma.student.update({
        where: { id: existing.studentId },
        data: { name },
      });
    } else {
      const student = await prisma.student.create({ data: { name } });
      return prisma.enrollment.update({
        where: { id: existing.id },
        data: { studentId: student.id, status: "active", leftAt: null },
      });
    }
  }
  return prisma.enrollment.update({
    where: { id: existing.id },
    data: { status: "active", leftAt: null },
  });
}

async function main() {
  // Usuários demo (um por perfil do login mockado).
  const teacherUser = await upsertUser(
    ROLES.teacher.demoEmail,
    "Renato Lima",
    "teacher",
  );
  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    create: { userId: teacherUser.id, displayName: "Prof. Renato" },
    update: { displayName: "Prof. Renato" },
  });

  await upsertUser(ROLES.secretary.demoEmail, "Márcia Souza", "secretary");

  const studentUser = await upsertUser(
    ROLES.student.demoEmail,
    LUCAS.name,
    "student",
  );
  const lucas = await prisma.student.upsert({
    where: { registrationNumber: LUCAS.registrationNumber },
    create: { ...LUCAS, userId: studentUser.id },
    update: { ...LUCAS, userId: studentUser.id },
  });

  const guardianUser = await upsertUser(
    ROLES.guardian.demoEmail,
    "Ana Andrade",
    "guardian",
  );
  const guardian = await prisma.guardian.upsert({
    where: { userId: guardianUser.id },
    create: { userId: guardianUser.id, phone: "+5511999990000" },
    update: { phone: "+5511999990000" },
  });
  await prisma.studentGuardian.upsert({
    where: {
      studentId_guardianId: { studentId: lucas.id, guardianId: guardian.id },
    },
    create: {
      studentId: lucas.id,
      guardianId: guardian.id,
      relationship: "Mãe",
    },
    update: { relationship: "Mãe" },
  });

  // Estrutura escolar. Desmarca os outros anos antes: só um pode ser o atual.
  await prisma.schoolYear.updateMany({
    where: { year: { not: SCHOOL_YEAR }, isCurrent: true },
    data: { isCurrent: false },
  });
  const schoolYear = await prisma.schoolYear.upsert({
    where: { year: SCHOOL_YEAR },
    create: { year: SCHOOL_YEAR, isCurrent: true },
    update: { isCurrent: true },
  });

  for (const period of SCHOOL_PERIODS) {
    const dates = {
      startDate: isoDate(period.startDate),
      endDate: isoDate(period.endDate),
    };
    await prisma.schoolPeriod.upsert({
      where: {
        schoolYearId_bimester: {
          schoolYearId: schoolYear.id,
          bimester: period.bimester,
        },
      },
      create: {
        schoolYearId: schoolYear.id,
        bimester: period.bimester,
        ...dates,
      },
      update: dates,
    });
  }

  const classes = await Promise.all(
    CLASSES.map((schoolClass) =>
      prisma.schoolClass.upsert({
        where: {
          schoolYearId_gradeLevel_name_shift: {
            schoolYearId: schoolYear.id,
            gradeLevel: schoolClass.gradeLevel,
            name: schoolClass.name,
            shift: schoolClass.shift,
          },
        },
        create: { ...schoolClass, schoolYearId: schoolYear.id },
        update: {
          educationLevel: schoolClass.educationLevel,
          sortOrder: schoolClass.sortOrder,
        },
      }),
    ),
  );

  const subjects = await Promise.all(
    SUBJECTS.map((subject) =>
      prisma.subject.upsert({
        where: { code: subject.code },
        create: subject,
        update: subject,
      }),
    ),
  );
  const math = subjects.find((subject) => subject.code === "00012")!;

  const assessmentTypes = await Promise.all(
    ASSESSMENT_TYPES.map((type) =>
      prisma.assessmentType.upsert({
        where: { code: type.code },
        create: type,
        update: type,
      }),
    ),
  );
  const typeByCode = new Map(assessmentTypes.map((type) => [type.code, type]));

  // Diários de Matemática do Prof. Renato (turmas A da manhã do 8º e 9º ano).
  for (const seedDiary of DIARIES) {
    const schoolClass = classes.find(
      (item) =>
        item.gradeLevel === seedDiary.gradeLevel &&
        item.name === "A" &&
        item.shift === "Manhã",
    )!;

    const diary = await prisma.diary.upsert({
      where: {
        schoolClassId_subjectId: {
          schoolClassId: schoolClass.id,
          subjectId: math.id,
        },
      },
      create: {
        schoolClassId: schoolClass.id,
        subjectId: math.id,
        teacherId: teacher.id,
      },
      update: { teacherId: teacher.id },
    });

    for (const [index, code] of MATH_ASSESSMENT_CODES.entries()) {
      const assessmentTypeId = typeByCode.get(code)!.id;
      await prisma.diaryAssessment.upsert({
        where: {
          diaryId_assessmentTypeId: { diaryId: diary.id, assessmentTypeId },
        },
        create: {
          diaryId: diary.id,
          assessmentTypeId,
          order: index + 1,
          maxGrade: 10,
        },
        update: { order: index + 1, maxGrade: 10 },
      });
    }

    const enrollmentByCallNumber = new Map<number, string>();
    for (const [index, name] of seedDiary.students.entries()) {
      const callNumber = index + 1;
      const enrollment = await upsertEnrollment(
        schoolClass.id,
        callNumber,
        name,
        lucas.id,
      );
      enrollmentByCallNumber.set(callNumber, enrollment.id);

      const p1 = seedDiary.p1Grades[callNumber];
      if (p1 === undefined) continue;
      const gradeKey = {
        enrollmentId: enrollment.id,
        diaryId: diary.id,
        bimester: P1_BIMESTER,
        assessmentTypeId: typeByCode.get("P1")!.id,
      };
      await prisma.grade.upsert({
        where: {
          enrollmentId_diaryId_bimester_assessmentTypeId: gradeKey,
        },
        create: { ...gradeKey, value: p1 },
        update: { value: p1 },
      });
    }

    // Assignment não tem chave natural única: procura pelo título no diário.
    for (const { grades, ...assignment } of seedDiary.assignments) {
      const data = {
        ...assignment,
        diaryId: diary.id,
        dueDate: isoDate(assignment.dueDate),
      };
      const existing = await prisma.assignment.findFirst({
        where: { diaryId: diary.id, title: assignment.title },
      });
      const saved = existing
        ? await prisma.assignment.update({ where: { id: existing.id }, data })
        : await prisma.assignment.create({ data });

      for (const [callNumber, value] of Object.entries(grades)) {
        const enrollmentId = enrollmentByCallNumber.get(Number(callNumber))!;
        await prisma.assignmentGrade.upsert({
          where: {
            assignmentId_enrollmentId: { assignmentId: saved.id, enrollmentId },
          },
          create: { assignmentId: saved.id, enrollmentId, value },
          update: { value },
        });
      }
    }
  }
}

main()
  .then(() => console.log("Seed concluído."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
