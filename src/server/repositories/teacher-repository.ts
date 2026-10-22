import "server-only";

import { prisma } from "@/server/db/prisma";

/** Professor vinculado à conta com o e-mail informado, com o nome da conta. */
export function findTeacherByEmail(email: string) {
  return prisma.teacher.findFirst({
    where: { user: { email } },
    include: { user: { select: { name: true } } },
  });
}
