import { formatGrade, getGradeBand } from "@/lib/grades";
import { Card } from "./card";
import { GradeBar } from "./grade-bar";

type SubjectGradeCardProps = {
  subject: string;
  /** Nome do ícone Material Symbols Outlined da disciplina. */
  icon: string;
  /**
   * Média de 0 a 10; a faixa (cor e rótulo) vem de `getGradeBand`. `null` quando
   * a média ainda não foi lançada (ela entra como valor, não é calculada).
   */
  average: number | null;
  absences: number;
  /** Detalhes abaixo da barra (ex.: notas por bimestre). */
  children?: React.ReactNode;
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
  children,
}: SubjectGradeCardProps) {
  const band = average === null ? null : getGradeBand(average);

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
        {average !== null && band ? (
          <div className={`text-right ${band.textClassName}`}>
            <span className="sr-only">Média </span>
            <span className="text-xl font-extrabold">
              {formatGrade(average)}
            </span>
            <p className="text-xs font-bold">{band.label}</p>
          </div>
        ) : (
          <p className="text-right text-xs text-neutral-500">
            Média ainda não lançada
          </p>
        )}
      </div>
      {average !== null && (
        <GradeBar average={average} label={`Nota de ${subject}`} />
      )}
      {children}
    </Card>
  );
}
