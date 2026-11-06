import { describe, expect, it } from "vitest";
import { classLabel, classLabels } from "./school-classes";

describe("classLabels", () => {
  it("diferencia duas turmas 8º A pelo turno", () => {
    const labels = classLabels([
      { id: "manha", gradeLevel: "8º", name: "A", shift: "Manhã" },
      { id: "tarde", gradeLevel: "8º", name: "A", shift: "Tarde" },
      { id: "nono", gradeLevel: "9º", name: "A", shift: "Manhã" },
    ]);
    expect(labels.get("manha")).toBe("8º A · Manhã");
    expect(labels.get("tarde")).toBe("8º A · Tarde");
    expect(labels.get("manha")).not.toBe(labels.get("tarde"));
  });

  it("não mostra o turno numa turma única", () => {
    const labels = classLabels([
      { id: "nono", gradeLevel: "9º", name: "A", shift: "Manhã" },
      { id: "oitavo-b", gradeLevel: "8º", name: "B", shift: "Tarde" },
    ]);
    expect(labels.get("nono")).toBe("9º A");
    expect(labels.get("oitavo-b")).toBe("8º B");
  });

  it("classLabel monta o rótulo com e sem turno", () => {
    const schoolClass = { gradeLevel: "1ª série", name: "A", shift: "Manhã" };
    expect(classLabel(schoolClass, { withShift: false })).toBe("1ª série A");
    expect(classLabel(schoolClass, { withShift: true })).toBe(
      "1ª série A · Manhã",
    );
  });
});
