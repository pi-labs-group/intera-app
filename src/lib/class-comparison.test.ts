import { describe, expect, it } from "vitest";
import {
  averageOf,
  compareWithClass,
  describeComparison,
  describeTeacherClassAverage,
} from "./class-comparison";

describe("compareWithClass", () => {
  it("oculta quando o aluno não tem nota", () => {
    expect(compareWithClass(null, { average: 7, count: 6 })).toEqual({
      status: "hidden",
      reason: "no-student-grade",
    });
  });

  it("oculta com amostra pequena", () => {
    expect(compareWithClass(8, { average: 7, count: 4 })).toEqual({
      status: "hidden",
      reason: "insufficient-sample",
    });
  });

  it("oculta quando a turma não tem média", () => {
    expect(compareWithClass(8, { average: null, count: 0 })).toEqual({
      status: "hidden",
      reason: "insufficient-sample",
    });
  });

  it("abaixo: 4,5 contra 7,0833 (P1 do 9º A no seed)", () => {
    expect(compareWithClass(4.5, { average: 42.5 / 6, count: 6 })).toEqual({
      status: "shown",
      studentValue: 4.5,
      classAverage: 7.1,
      sampleSize: 6,
      difference: -2.6,
      position: "below",
    });
  });

  it("igual depois de arredondar: 7,04 contra 7,0", () => {
    const result = compareWithClass(7.04, { average: 7.0, count: 5 });
    expect(result).toMatchObject({
      status: "shown",
      studentValue: 7,
      classAverage: 7,
      difference: 0,
      position: "equal",
    });
  });

  it("acima: 9 contra 7,08", () => {
    expect(compareWithClass(9, { average: 7.08, count: 6 })).toMatchObject({
      status: "shown",
      classAverage: 7.1,
      difference: 1.9,
      position: "above",
    });
  });

  it("aceita outro mínimo de amostra", () => {
    expect(compareWithClass(8, { average: 7, count: 2 }, 2).status).toBe(
      "shown",
    );
  });
});

describe("averageOf", () => {
  it("lista vazia não tem média", () => {
    expect(averageOf([])).toEqual({ average: null, count: 0 });
  });

  it("média simples", () => {
    expect(averageOf([7.5, 6, 9, 8.5, 7, 4.5])).toEqual({
      average: 42.5 / 6,
      count: 6,
    });
  });
});

describe("textos", () => {
  it("descreve a posição em texto, com 'média da turma'", () => {
    const below = compareWithClass(4.5, { average: 42.5 / 6, count: 6 });
    expect(describeComparison(below)).toBe(
      "Turma: 7,1 (6 notas) · abaixo da média da turma (−2,6)",
    );
    const above = compareWithClass(9, { average: 7.08, count: 6 });
    expect(describeComparison(above)).toBe(
      "Turma: 7,1 (6 notas) · acima da média da turma (+1,9)",
    );
    const equal = compareWithClass(7.04, { average: 7, count: 5 });
    expect(describeComparison(equal)).toBe(
      "Turma: 7,0 (5 notas) · igual à média da turma",
    );
  });

  it("explica a média oculta por amostra pequena e omite sem nota do aluno", () => {
    expect(
      describeComparison({ status: "hidden", reason: "insufficient-sample" }),
    ).toBe("Média da turma indisponível (poucas notas lançadas)");
    expect(
      describeComparison({ status: "hidden", reason: "no-student-grade" }),
    ).toBeNull();
  });

  it("linha do professor", () => {
    expect(
      describeTeacherClassAverage({ average: 42.5 / 6, count: 6 }, 7),
    ).toBe("Média da turma nesta avaliação: 7,1 (6 de 7 alunos)");
    expect(describeTeacherClassAverage({ average: null, count: 0 }, 7)).toBe(
      "Média da turma nesta avaliação: sem notas lançadas.",
    );
  });
});
