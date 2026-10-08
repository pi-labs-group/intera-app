"use client";

import type { DiaryStudent } from "@/types/school";

type AttendanceListProps = {
  students: DiaryStudent[];
  /** Matrículas marcadas com falta na data selecionada. */
  absentIds: Set<string>;
  onToggle: (enrollmentId: string) => void;
};

/**
 * Chamada do dia: um interruptor por aluno (Frequencia.presente). O estado aparece
 * em texto ("Presente"/"Falta"), não só pela cor.
 */
export function AttendanceList({
  students,
  absentIds,
  onToggle,
}: AttendanceListProps) {
  return (
    <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-surface px-4">
      {students.map((student) => {
        const isPresent = !absentIds.has(student.enrollmentId);
        return (
          <li
            key={student.enrollmentId}
            className="flex items-center gap-3 py-2.5"
          >
            <span className="w-6 text-xs font-semibold text-neutral-500">
              {String(student.callNumber).padStart(2, "0")}
            </span>
            <span className="flex-1 text-sm font-medium text-neutral-800">
              {student.name}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isPresent}
              aria-label={`Presença de ${student.name}`}
              onClick={() => onToggle(student.enrollmentId)}
              className={`flex w-24 items-center justify-center gap-1 rounded-full py-1 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isPresent
                  ? "bg-success-soft text-success-strong"
                  : "bg-danger-soft text-danger-strong"
              }`}
            >
              <span
                className="material-symbols-outlined text-base"
                aria-hidden="true"
              >
                {isPresent ? "check" : "close"}
              </span>
              {isPresent ? "Presente" : "Falta"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
