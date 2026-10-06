import { formatGrade, getGradeBand } from "@/lib/grades";
import { Card } from "./card";
import { GradeBar } from "./grade-bar";

type SubjectGradeCardProps = {
  subject: string;
  /** Nome do ícone Material Symbols Outlined da disciplina. */
  icon: string;
  /** Média de 0 a 10; a faixa (cor e rótulo) vem de `getGradeBand`. */
  average: number;
  absences: number;
};

/**
 * Card de desempenho por disciplina: ícone, nome, faltas, nota com o rótulo da
 * faixa e barra de progresso.
 */
export function SubjectGradeCard({
  subject,
  icon,
  average,
  absences,
}: SubjectGradeCardProps) {
  const { label, textClassName } = getGradeBand(average);

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <span className="material-symbols-outlined" aria-hidden="true">
              {icon}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-800">{subject}</h2>
            <p className="text-xs text-neutral-500">
              {absences} {absences === 1 ? "falta" : "faltas"}
            </p>
          </div>
        </div>
        <div className={`text-right ${textClassName}`}>
          <span className="sr-only">Média </span>
          <span className="text-xl font-extrabold">{formatGrade(average)}</span>
          <p className="text-xs font-bold">{label}</p>
        </div>
      </div>
      <GradeBar average={average} label={`Nota de ${subject}`} />
    </Card>
  );
}
