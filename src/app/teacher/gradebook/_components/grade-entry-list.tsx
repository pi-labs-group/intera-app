"use client";

import { parseGrade } from "@/lib/validation/teacher";
import type { DiaryStudent } from "@/types/school";

type GradeEntryListProps = {
  students: DiaryStudent[];
  /** Valor digitado por matrícula (texto cru, para aceitar "7,5" durante a digitação). */
  values: Record<string, string>;
  maxGrade: number;
  /** Descrição da avaliação usada nos nomes acessíveis (ex.: "Prova 1"). */
  assessmentLabel: string;
  onChange: (enrollmentId: string, value: string) => void;
};

/**
 * Lista de alunos com um campo de nota cada, no formato da tela "Lançar notas" do
 * protótipo. Notas fora da faixa aparecem com erro em texto logo abaixo do aluno.
 */
export function GradeEntryList({
  students,
  values,
  maxGrade,
  assessmentLabel,
  onChange,
}: GradeEntryListProps) {
  return (
    <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-surface px-4">
      {students.map((student) => {
        const inputId = `grade-${student.enrollmentId}`;
        const errorId = `${inputId}-error`;
        const result = parseGrade(values[student.enrollmentId] ?? "", maxGrade);
        const error = result.ok ? undefined : result.error;

        return (
          <li key={student.enrollmentId} className="py-2.5">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-semibold text-neutral-500">
                {String(student.callNumber).padStart(2, "0")}
              </span>
              <label
                htmlFor={inputId}
                className="flex-1 text-sm font-medium text-neutral-800"
              >
                <span className="sr-only">{assessmentLabel} de </span>
                {student.name}
              </label>
              <div className="flex items-center gap-1">
                <input
                  id={inputId}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="—"
                  value={values[student.enrollmentId] ?? ""}
                  onChange={(event) =>
                    onChange(student.enrollmentId, event.target.value)
                  }
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className="w-16 rounded-lg border border-neutral-300 bg-surface px-2 py-1.5 text-right text-sm font-bold text-neutral-900 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary aria-invalid:border-danger"
                />
                <span className="text-xs text-neutral-500">/{maxGrade}</span>
              </div>
            </div>
            {error && (
              <p id={errorId} className="mt-1 pl-9 text-xs text-danger-text">
                {error}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
