import "server-only";

import { cache } from "react";
import {
  resolveCurrentBimester,
  todayInSaoPaulo,
  type SchoolPeriodRange,
} from "@/lib/school-calendar";
import {
  findCurrentSchoolYear,
  listPeriods,
} from "@/server/repositories/school-calendar-repository";
import type { Bimester } from "@/types/school";

/**
 * Ano letivo e bimestre atuais, lidos do calendário cadastrado (SchoolYear e
 * SchoolPeriod). Memoizados por requisição, pois várias telas e serviços os usam.
 */

/** Data `@db.Date` vinda do Prisma (meia-noite UTC) como AAAA-MM-DD. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toPeriodRange(period: {
  bimester: number;
  startDate: Date;
  endDate: Date;
}): SchoolPeriodRange {
  return {
    // O CHECK school_periods_bimester_chk garante 1 a 4.
    bimester: period.bimester as Bimester,
    startDate: toIsoDate(period.startDate),
    endDate: toIsoDate(period.endDate),
  };
}

export const getCurrentSchoolYear = cache(() => findCurrentSchoolYear());

export const getSchoolPeriods = cache(
  async (): Promise<SchoolPeriodRange[]> => {
    const schoolYear = await getCurrentSchoolYear();
    if (!schoolYear) return [];
    const periods = await listPeriods(schoolYear.id);
    return periods.map(toPeriodRange);
  },
);

/** Bimestre em vigor hoje (fuso de São Paulo); sem calendário cadastrado, o 1º. */
export async function getCurrentBimester(): Promise<Bimester> {
  return resolveCurrentBimester(
    await getSchoolPeriods(),
    todayInSaoPaulo(new Date()),
  );
}
