import { formatGrade, roundTo1 } from "@/lib/grades";
import { MIN_CLASS_SAMPLE } from "@/lib/school-config";

/**
 * Comparação da nota do aluno com a média da turma no mesmo item (avaliação,
 * trabalho ou média do bimestre).
 *
 * Privacidade: o aluno e o responsável só recebem o agregado (média e
 * quantidade), calculado no servidor; com menos de `MIN_CLASS_SAMPLE` notas a
 * média não é exibida, para dificultar a dedução de notas alheias.
 */

/** Média e quantidade de notas lançadas por matrículas ativas no item. */
export type ClassAggregate = { average: number | null; count: number };

export type ClassComparison =
  | { status: "hidden"; reason: "no-student-grade" | "insufficient-sample" }
  | {
      status: "shown";
      /** Arredondado a 1 casa. */
      studentValue: number;
      /** Arredondado a 1 casa; inclui a nota do próprio aluno. */
      classAverage: number;
      sampleSize: number;
      /** studentValue − classAverage, 1 casa. */
      difference: number;
      position: "above" | "equal" | "below";
    };

/**
 * Compara a nota do aluno com a média da turma. A posição é calculada sobre os
 * valores já arredondados a 1 casa (os mesmos exibidos), em décimos inteiros,
 * para a tela nunca dizer "abaixo" com dois números iguais nem sofrer erro de
 * ponto flutuante.
 *
 * @param studentValue Nota do aluno no item; `null` se não houver.
 * @param aggregate Agregado da turma no mesmo item (a nota do aluno entra nele).
 * @param minSample Mínimo de notas para exibir a média (D5).
 */
export function compareWithClass(
  studentValue: number | null,
  aggregate: ClassAggregate,
  minSample: number = MIN_CLASS_SAMPLE,
): ClassComparison {
  if (studentValue === null) {
    return { status: "hidden", reason: "no-student-grade" };
  }
  if (aggregate.average === null || aggregate.count < minSample) {
    return { status: "hidden", reason: "insufficient-sample" };
  }
  const studentTenths = Math.round(roundTo1(studentValue) * 10);
  const classTenths = Math.round(roundTo1(aggregate.average) * 10);
  const differenceTenths = studentTenths - classTenths;
  return {
    status: "shown",
    studentValue: studentTenths / 10,
    classAverage: classTenths / 10,
    sampleSize: aggregate.count,
    difference: differenceTenths / 10,
    position:
      differenceTenths > 0 ? "above" : differenceTenths < 0 ? "below" : "equal",
  };
}

/** Média simples de valores já validados; usada no editor do professor. */
export function averageOf(values: number[]): ClassAggregate {
  if (values.length === 0) return { average: null, count: 0 };
  const sum = values.reduce((total, value) => total + value, 0);
  return { average: sum / values.length, count: values.length };
}

/** Diferença com sinal explícito ("+1,9", "−2,6"); o sinal de menos é U+2212. */
function formatDifference(difference: number): string {
  const absolute = formatGrade(Math.abs(difference));
  return difference > 0 ? `+${absolute}` : `−${absolute}`;
}

/**
 * Texto da comparação exibido ao aluno e ao responsável, ou `null` quando o
 * aluno não tem nota no item. A posição sempre vai em texto, não só em cor, e
 * diz "média da turma" para não se confundir com o rótulo "ABAIXO DA MÉDIA" da
 * faixa de aprovação.
 */
export function describeComparison(comparison: ClassComparison): string | null {
  if (comparison.status === "hidden") {
    return comparison.reason === "insufficient-sample"
      ? "Média da turma indisponível (poucas notas lançadas)"
      : null;
  }
  const { classAverage, sampleSize, difference, position } = comparison;
  const base = `Turma: ${formatGrade(classAverage)} (${sampleSize} notas)`;
  if (position === "equal") return `${base} · igual à média da turma`;
  const where = position === "above" ? "acima" : "abaixo";
  return `${base} · ${where} da média da turma (${formatDifference(difference)})`;
}

/**
 * Linha do editor do professor. Para ele não há mínimo de amostra: já vê todas
 * as notas da turma.
 *
 * @param aggregate Média dos valores válidos digitados.
 * @param studentCount Alunos ativos no diário.
 */
export function describeTeacherClassAverage(
  aggregate: ClassAggregate,
  studentCount: number,
): string {
  if (aggregate.average === null) {
    return "Média da turma nesta avaliação: sem notas lançadas.";
  }
  return `Média da turma nesta avaliação: ${formatGrade(aggregate.average)} (${aggregate.count} de ${studentCount} alunos)`;
}
