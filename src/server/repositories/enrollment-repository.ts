import "server-only";

import type { DbClient } from "@/server/db/types";

/** Ids das matrículas ativas da turma, para conferir um lote antes de gravar. */
export async function listActiveEnrollmentIds(
  client: DbClient,
  schoolClassId: string,
): Promise<Set<string>> {
  const enrollments = await client.enrollment.findMany({
    where: { schoolClassId, status: "active" },
    select: { id: true },
  });
  return new Set(enrollments.map((enrollment) => enrollment.id));
}
