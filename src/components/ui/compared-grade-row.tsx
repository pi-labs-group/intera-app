import { formatGrade } from "@/lib/grades";

type ComparedGradeRowProps = {
  /** Nome do item (ex.: "Prova 1", título do trabalho, "Média do bimestre"). */
  label: string;
  value: number;
  /**
   * Linha secundária com a comparação com a turma, já em texto (ver
   * `describeComparison`); `null` omite a linha.
   */
  comparison: string | null;
};

/** Linha de uma nota do aluno, com a comparação com a média da turma em texto. */
export function ComparedGradeRow({
  label,
  value,
  comparison,
}: ComparedGradeRowProps) {
  return (
    <li className="py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-neutral-800">{label}</span>
        <span className="text-sm font-bold text-neutral-900">
          {formatGrade(value)}
        </span>
      </div>
      {comparison && <p className="text-xs text-neutral-500">{comparison}</p>}
    </li>
  );
}
