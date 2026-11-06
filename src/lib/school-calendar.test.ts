import { describe, expect, it } from "vitest";
import {
  calendarYearInSaoPaulo,
  isWithinSchoolPeriods,
  resolveCurrentBimester,
  todayInSaoPaulo,
  type SchoolPeriodRange,
} from "./school-calendar";

// Mesmas datas fictícias do seed (D4).
const PERIODS: SchoolPeriodRange[] = [
  { bimester: 3, startDate: "2026-08-03", endDate: "2026-10-02" },
  { bimester: 1, startDate: "2026-02-02", endDate: "2026-04-17" },
  { bimester: 4, startDate: "2026-10-05", endDate: "2026-12-18" },
  { bimester: 2, startDate: "2026-04-20", endDate: "2026-07-03" },
];

describe("fuso de São Paulo", () => {
  it("ainda é 2026 às 23:30 de 31/12 em São Paulo", () => {
    expect(calendarYearInSaoPaulo(new Date("2027-01-01T02:30:00Z"))).toBe(2026);
  });

  it("ainda é 02/11 às 22:00 em São Paulo", () => {
    expect(todayInSaoPaulo(new Date("2026-11-03T01:00:00Z"))).toBe(
      "2026-11-02",
    );
  });
});

describe("resolveCurrentBimester", () => {
  it("devolve o bimestre que contém a data", () => {
    expect(resolveCurrentBimester(PERIODS, "2026-05-10")).toBe(2);
  });

  it("inclui as datas de início e fim", () => {
    expect(resolveCurrentBimester(PERIODS, "2026-04-20")).toBe(2);
    expect(resolveCurrentBimester(PERIODS, "2026-07-03")).toBe(2);
  });

  it("no recesso entre o 2º e o 3º, devolve o 2º", () => {
    expect(resolveCurrentBimester(PERIODS, "2026-07-20")).toBe(2);
  });

  it("antes do 1º, devolve o 1º", () => {
    expect(resolveCurrentBimester(PERIODS, "2026-01-15")).toBe(1);
  });

  it("depois do 4º, devolve o 4º", () => {
    expect(resolveCurrentBimester(PERIODS, "2026-12-28")).toBe(4);
  });

  it("sem calendário, devolve o 1º", () => {
    expect(resolveCurrentBimester([], "2026-05-10")).toBe(1);
  });
});

describe("isWithinSchoolPeriods", () => {
  it("aceita dia letivo e recusa recesso", () => {
    expect(isWithinSchoolPeriods(PERIODS, "2026-10-05")).toBe(true);
    expect(isWithinSchoolPeriods(PERIODS, "2026-07-20")).toBe(false);
  });
});
