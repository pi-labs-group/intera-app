import "server-only";

import { db } from "@/server/db/prisma";

/**
 * Professor vinculado à conta com o e-mail informado, com o nome da conta. A
 * conta precisa ter o perfil de professor: um registro Teacher ligado a uma
 * conta de outro perfil não vale como professor.
 */
export function findTeacherByEmail(email: string) {
  return db().teacher.findFirst({
    where: { user: { email, role: "teacher" } },
    include: { user: { select: { name: true } } },
  });
}
