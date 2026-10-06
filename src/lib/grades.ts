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
 * Regra: média < 5 → "low"; 5 ≤ média < 7 → "mid"; média ≥ 7 → "high".
 * As cores `grade-*` são exclusivas das telas de desempenho.
 *
 * @param average Média da disciplina, de 0 a 10.
 * @returns Faixa, rótulo, classes de cor e largura da barra (limitada a 0–100%).
 */
export function getGradeBand(average: number): GradeBandInfo {
  // os cortes 5 e 7 são provisórios, pendente confirmação da média de aprovação com a escola
  const band: GradeBand = average < 5 ? "low" : average < 7 ? "mid" : "high";
  const widthPercent = Math.min(100, Math.max(0, average * 10));
  return { ...BANDS[band], widthPercent };
}

/** Formata a nota no padrão brasileiro, sempre com uma casa decimal (4.5 → "4,5"). */
export function formatGrade(average: number): string {
  return average.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
