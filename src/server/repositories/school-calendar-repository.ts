import "server-only";

import { calendarYearInSaoPaulo } from "@/lib/school-calendar";
import { db } from "@/server/db/prisma";

/**
 * Ano letivo atual: o marcado com `isCurrent` (no máximo um, pelo índice parcial).
 * Sem nenhum marcado, recorre ao ano civil de São Paulo, como antes da migração.
 */
export async function findCurrentSchoolYear() {
  const current = await db().schoolYear.findFirst({
    where: { isCurrent: true },
  });
  return (
    current ??
    db().schoolYear.findUnique({
      where: { year: calendarYearInSaoPaulo(new Date()) },
    })
  );
}

export function listPeriods(schoolYearId: number) {
  return db().schoolPeriod.findMany({
    where: { schoolYearId },
    orderBy: { bimester: "asc" },
  });
}
