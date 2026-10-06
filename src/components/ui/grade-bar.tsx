import { formatGrade, getGradeBand } from "@/lib/grades";

type GradeBarProps = {
  /** Média de 0 a 10; define a largura e a cor da faixa. */
  average: number;
  /** Nome acessível da barra (ex.: "Nota de Matemática"). */
  label: string;
};

/**
 * Barra de progresso da nota: trilho neutro e preenchimento na cor da faixa.
 * Exposta como `progressbar` na escala 0–10, com a faixa no texto acessível.
 */
export function GradeBar({ average, label }: GradeBarProps) {
  const {
    barClassName,
    widthPercent,
    label: bandLabel,
  } = getGradeBand(average);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={average}
      aria-valuetext={`${formatGrade(average)} de 10, ${bandLabel}`}
      className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
    >
      <div
        className={`h-full rounded-full ${barClassName}`}
        style={{ width: `${widthPercent}%` }}
      />
    </div>
  );
}
