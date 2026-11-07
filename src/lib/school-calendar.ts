import type { Bimester } from "@/types/school";

/**
 * Funções de calendário escolar sem acesso a banco. A escola opera no fuso de
 * São Paulo: um servidor em UTC não pode virar o ano ou o dia antes da escola.
 */

const SCHOOL_TIME_ZONE = "America/Sao_Paulo";

/** Ano civil em São Paulo; usado só quando nenhum ano letivo está marcado como atual. */
export function calendarYearInSaoPaulo(now: Date): number {
  const year = new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
  }).format(now);
  return Number(year);
}

/** Data de hoje em São Paulo no formato do `<input type="date">` (AAAA-MM-DD). */
export function todayInSaoPaulo(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
  }).format(now);
}

export type SchoolPeriodRange = {
  bimester: Bimester;
  /** AAAA-MM-DD, inclusivo. */
  startDate: string;
  /** AAAA-MM-DD, inclusivo. */
  endDate: string;
};

/**
 * Bimestre em vigor numa data. Fora de período (férias, recesso) vale o último
 * bimestre que já começou, para o professor continuar lançando o bimestre que
 * acabou de fechar; antes do primeiro período, o 1º.
 *
 * @param periods Bimestres do ano letivo, em qualquer ordem.
 * @param today Data de referência (AAAA-MM-DD); comparação lexicográfica é segura nesse formato.
 */
export function resolveCurrentBimester(
  periods: SchoolPeriodRange[],
  today: string,
): Bimester {
  const sorted = [...periods].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );
  const containing = sorted.find(
    (period) => period.startDate <= today && today <= period.endDate,
  );
  if (containing) return containing.bimester;
  const started = sorted.filter((period) => period.startDate <= today);
  return started.at(-1)?.bimester ?? 1;
}

/** Indica se a data cai dentro de algum bimestre do ano letivo. */
export function isWithinSchoolPeriods(
  periods: SchoolPeriodRange[],
  date: string,
): boolean {
  return periods.some(
    (period) => period.startDate <= date && date <= period.endDate,
  );
}
