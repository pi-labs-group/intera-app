import { describe, expect, it } from "vitest";
import { formatGrade, getGradeBand, roundTo1 } from "./grades";

describe("getGradeBand", () => {
  it.each([
    [0, "low"],
    [5.99, "low"],
    [6, "mid"],
    [6.99, "mid"],
    [7, "high"],
    [10, "high"],
  ])("classifica %d como %s", (average, band) => {
    expect(getGradeBand(average).band).toBe(band);
  });

  it("limita a largura da barra entre 0 e 100", () => {
    expect(getGradeBand(-1).widthPercent).toBe(0);
    expect(getGradeBand(4.5).widthPercent).toBe(45);
    expect(getGradeBand(12).widthPercent).toBe(100);
  });
});

describe("roundTo1 e formatGrade", () => {
  it("arredonda meio para cima, sem erro de ponto flutuante", () => {
    expect(roundTo1(7.05)).toBe(7.1);
    expect(roundTo1(7.0833)).toBe(7.1);
    expect(roundTo1(7.04)).toBe(7);
  });

  it("formata no padrão brasileiro com 1 casa", () => {
    expect(formatGrade(4.5)).toBe("4,5");
    expect(formatGrade(7.0833)).toBe("7,1");
    expect(formatGrade(10)).toBe("10,0");
  });
});
