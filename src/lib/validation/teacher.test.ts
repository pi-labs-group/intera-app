import { describe, expect, it } from "vitest";
import { parseGrade } from "./teacher";

describe("parseGrade", () => {
  it.each(["", "  "])("trata %j como nota não lançada", (raw) => {
    expect(parseGrade(raw, 10)).toEqual({ ok: true, value: null });
  });

  it.each([
    ["7", 7],
    ["7,5", 7.5],
    ["7.5", 7.5],
    ["10", 10],
    ["0", 0],
    ["9,75", 9.75],
    [" 8,5 ", 8.5],
  ])("aceita %j como %d", (raw, value) => {
    expect(parseGrade(raw, 10)).toEqual({ ok: true, value });
  });

  it.each(["1e1", "0x5", "0b11", "7.", ".5", "7,555", "-1", "7,5,3", "abc"])(
    "recusa o formato %j",
    (raw) => {
      expect(parseGrade(raw, 10)).toEqual({
        ok: false,
        error: "Use até 2 casas decimais (ex.: 7,5).",
      });
    },
  );

  it("recusa nota acima da máxima", () => {
    expect(parseGrade("10,5", 10)).toEqual({
      ok: false,
      error: "A nota máxima é 10.",
    });
  });

  it("respeita nota máxima diferente de 10", () => {
    expect(parseGrade("5", 5)).toEqual({ ok: true, value: 5 });
    expect(parseGrade("5,5", 5).ok).toBe(false);
  });
});
