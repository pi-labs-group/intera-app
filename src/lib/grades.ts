import { HIGH_GRADE, PASSING_GRADE } from "@/lib/school-config";

export type GradeBand = "low" | "mid" | "high";

export type GradeBandInfo = {
  band: GradeBand;
  /** Rótulo que sempre acompanha a nota: a cor nunca é o único sinal da faixa. */
  label: string;
  /** Cor de preenchimento da barra (vívida, só para preenchimento). */
  barClassName: string;
  /** Cor do número e do rótulo (variante `-text`, que passa no contraste AA). */
  textClassName: string;
  /** Largura da barra em %, proporcional à nota na escala 0–10. */
  widthPercent: number;
};

// Classes completas e literais para o Tailwind detectá-las.
const BANDS: Record<GradeBand, Omit<GradeBandInfo, "widthPercent">> = {
  low: {
    band: "low",
    label: "ABAIXO DA MÉDIA",
    barClassName: "bg-grade-low",
    textClassName: "text-grade-low-text",
  },
  mid: {
    band: "mid",
    label: "ATENÇÃO",
    barClassName: "bg-grade-mid",
    textClassName: "text-grade-mid-text",
  },
  high: {
    band: "high",
    label: "ÓTIMO",
    barClassName: "bg-grade-high",
    textClassName: "text-grade-high-text",
  },
};

/**
 * Classifica uma média (escala 0–10) na faixa da escala de notas e devolve o que a
 * interface precisa para exibi-la.
 *
 * Regra: média < PASSING_GRADE → "low"; < HIGH_GRADE → "mid"; demais → "high"
 * (cortes provisórios em src/lib/school-config.ts). As cores `grade-*` são
 * exclusivas das telas de desempenho.
 *
 * @param average Média da disciplina, de 0 a 10.
 * @returns Faixa, rótulo, classes de cor e largura da barra (limitada a 0–100%).
 */
export function getGradeBand(average: number): GradeBandInfo {
  const band: GradeBand =
    average < PASSING_GRADE ? "low" : average < HIGH_GRADE ? "mid" : "high";
  const widthPercent = Math.min(100, Math.max(0, average * 10));
  return { ...BANDS[band], widthPercent };
}

/**
 * Arredonda a 1 casa decimal (meio para cima). O `EPSILON` corrige casos como
 * 7.05, que em ponto flutuante vale 7.0499… e arredondaria para baixo.
 */
export function roundTo1(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

/**
 * Formata a nota no padrão brasileiro, sempre com uma casa decimal (4.5 → "4,5").
 * Usa `roundTo1`, o mesmo arredondamento da comparação com a turma, para o texto
 * exibido nunca divergir da posição calculada.
 */
export function formatGrade(average: number): string {
  return roundTo1(average).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
