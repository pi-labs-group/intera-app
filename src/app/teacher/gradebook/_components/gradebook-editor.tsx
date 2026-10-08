"use client";

import { useState } from "react";
import {
  FIELD_ERROR_CLASSES,
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
  SECONDARY_BUTTON_CLASSES,
} from "@/components/ui/form-classes";
import { Tabs } from "@/components/ui/tabs";
import { gradeKey } from "@/lib/gradebook";
import { assignmentSchema, parseGrade } from "@/lib/validation/teacher";
import type { Assignment, Bimester, Diary } from "@/types/school";
import { AttendanceList } from "./attendance-list";
import { GradeEntryList } from "./grade-entry-list";

export type GradebookTab = "grades" | "assignments" | "attendance";

type GradebookEditorProps = {
  /** Diários do professor; a página trata o caso sem nenhum diário. */
  diaries: [Diary, ...Diary[]];
  /** Data de hoje (AAAA-MM-DD) calculada no servidor, para evitar divergência de fuso na hidratação. */
  today: string;
  defaultTab?: GradebookTab;
  /** Notas já lançadas, no formato de `gradeKey`. */
  initialGrades: Record<string, string>;
};

const BIMESTERS: Bimester[] = [1, 2, 3, 4];
const CURRENT_BIMESTER: Bimester = 4;
const ASSIGNMENT_MAX_GRADE = 10;

/** Resultado da última ação; fica preso à aba onde foi gerado. */
type SaveFeedback = {
  tab: GradebookTab;
  tone: "success" | "error";
  message: string;
} | null;

function Feedback({
  feedback,
  tab,
}: {
  feedback: SaveFeedback;
  tab: GradebookTab;
}) {
  return (
    <div role="status" aria-live="polite">
      {feedback?.tab === tab && (
        <p
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            feedback.tone === "success"
              ? "bg-success-soft text-success-strong"
              : "bg-danger-soft text-danger-strong"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}

/**
 * Editor do diário do professor: escolhe turma e bimestre e lança notas de
 * avaliações, trabalhos e faltas. Tudo fica em estado local — salvar apenas
 * simula a gravação, pois ainda não há banco de dados.
 *
 * TODO (fase E): salvar via Server Actions (NotaService.lancar e
 * FrequenciaService.registrar), com os DTOs validados na borda.
 */
export function GradebookEditor({
  diaries,
  today,
  defaultTab,
  initialGrades,
}: GradebookEditorProps) {
  const [diaryId, setDiaryId] = useState(diaries[0].id);
  const [bimester, setBimester] = useState<Bimester>(CURRENT_BIMESTER);
  const [grades, setGrades] = useState(initialGrades);
  const [feedback, setFeedback] = useState<SaveFeedback>(null);

  const [assessmentId, setAssessmentId] = useState(
    diaries[0].assessments[0]?.id ?? "",
  );

  const [assignmentsByDiary, setAssignmentsByDiary] = useState<
    Record<string, Assignment[]>
  >(() =>
    Object.fromEntries(diaries.map((diary) => [diary.id, diary.assignments])),
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(
    diaries[0].assignments[0]?.id ?? "",
  );
  const [assignmentDraft, setAssignmentDraft] = useState({
    title: "",
    dueDate: today,
    description: "",
  });
  const [assignmentErrors, setAssignmentErrors] = useState<
    Partial<Record<"title" | "dueDate" | "description", string>>
  >({});

  const [attendanceDate, setAttendanceDate] = useState(today);
  /** Faltas por "diário|data", para cada chamada guardar a sua marcação. */
  const [absences, setAbsences] = useState<Record<string, Set<string>>>({});

  const diary = diaries.find((item) => item.id === diaryId) ?? diaries[0];

  const assessment =
    diary.assessments.find((item) => item.id === assessmentId) ??
    diary.assessments[0];
  const assignments = assignmentsByDiary[diary.id] ?? [];
  const selectedAssignment =
    assignments.find((item) => item.id === selectedAssignmentId) ??
    assignments[0];
  const attendanceKey = `${diary.id}|${attendanceDate}`;
  const absentIds = absences[attendanceKey] ?? new Set<string>();

  function changeDiary(nextDiaryId: string) {
    const nextDiary = diaries.find((item) => item.id === nextDiaryId);
    setDiaryId(nextDiaryId);
    setAssessmentId(nextDiary?.assessments[0]?.id ?? "");
    setSelectedAssignmentId(assignmentsByDiary[nextDiaryId]?.[0]?.id ?? "");
    setFeedback(null);
  }

  /** Valores digitados de uma avaliação, indexados por matrícula. */
  function valuesFor(evaluationId: string): Record<string, string> {
    return Object.fromEntries(
      diary.students.map((student) => [
        student.enrollmentId,
        grades[
          gradeKey(diary.id, bimester, evaluationId, student.enrollmentId)
        ] ?? "",
      ]),
    );
  }

  function updateGrade(
    evaluationId: string,
    enrollmentId: string,
    value: string,
  ) {
    setGrades((current) => ({
      ...current,
      [gradeKey(diary.id, bimester, evaluationId, enrollmentId)]: value,
    }));
    setFeedback(null);
  }

  function saveGrades(
    tab: GradebookTab,
    evaluationId: string,
    evaluationName: string,
    maxGrade: number,
  ) {
    const results = Object.values(valuesFor(evaluationId)).map((raw) =>
      parseGrade(raw, maxGrade),
    );
    const invalidCount = results.filter((result) => !result.ok).length;
    if (invalidCount > 0) {
      setFeedback({
        tab,
        tone: "error",
        message: `Corrija ${invalidCount} ${invalidCount === 1 ? "nota inválida" : "notas inválidas"} antes de salvar.`,
      });
      return;
    }
    const filled = results.filter(
      (result) => result.ok && result.value !== null,
    ).length;
    setFeedback({
      tab,
      tone: "success",
      message: `${evaluationName}: ${filled} de ${results.length} notas salvas no ${bimester}º bimestre (simulação, sem banco de dados).`,
    });
  }

  function addAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = assignmentSchema.safeParse(assignmentDraft);
    if (!parsed.success) {
      const errors: typeof assignmentErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof typeof errors;
        errors[field] ??= issue.message;
      }
      setAssignmentErrors(errors);
      return;
    }

    const assignment: Assignment = {
      id: `trab-${Date.now()}`,
      ...parsed.data,
    };
    setAssignmentsByDiary((current) => ({
      ...current,
      [diary.id]: [...(current[diary.id] ?? []), assignment],
    }));
    setSelectedAssignmentId(assignment.id);
    setAssignmentDraft({ title: "", dueDate: today, description: "" });
    setAssignmentErrors({});
    setFeedback({
      tab: "assignments",
      tone: "success",
      message: `Trabalho "${assignment.title}" cadastrado para o ${diary.className}. Lance as notas abaixo.`,
    });
  }

  function toggleAbsence(enrollmentId: string) {
    setAbsences((current) => {
      const next = new Set(current[attendanceKey] ?? []);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return { ...current, [attendanceKey]: next };
    });
    setFeedback(null);
  }

  function markAllPresent() {
    setAbsences((current) => ({ ...current, [attendanceKey]: new Set() }));
    setFeedback(null);
  }

  function saveAttendance() {
    const count = absentIds.size;
    const [year, month, day] = attendanceDate.split("-");
    setFeedback({
      tab: "attendance",
      tone: "success",
      message: `Chamada de ${day}/${month}/${year} salva: ${count} ${count === 1 ? "falta" : "faltas"} (simulação, sem banco de dados).`,
    });
  }

  const gradesPanel = assessment ? (
    <div className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="assessment" className={LABEL_CLASSES}>
          Avaliação
        </label>
        <select
          id="assessment"
          value={assessment.id}
          onChange={(event) => {
            setAssessmentId(event.target.value);
            setFeedback(null);
          }}
          className={INPUT_CLASSES}
        >
          {diary.assessments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.code})
            </option>
          ))}
        </select>
      </div>
      <GradeEntryList
        students={diary.students}
        values={valuesFor(assessment.id)}
        maxGrade={assessment.maxGrade}
        assessmentLabel={assessment.name}
        onChange={(enrollmentId, value) =>
          updateGrade(assessment.id, enrollmentId, value)
        }
      />
      <Feedback feedback={feedback} tab="grades" />
      <button
        type="button"
        onClick={() =>
          saveGrades(
            "grades",
            assessment.id,
            assessment.name,
            assessment.maxGrade,
          )
        }
        className={PRIMARY_BUTTON_CLASSES}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          check
        </span>
        Salvar notas
      </button>
    </div>
  ) : (
    <p className="text-center text-sm text-neutral-500">
      Este diário ainda não tem avaliações configuradas pela secretaria.
    </p>
  );

  const assignmentsPanel = (
    <div className="space-y-5">
      <form
        onSubmit={addAssignment}
        noValidate
        className="space-y-3 rounded-2xl border border-primary-border bg-surface p-4"
      >
        <h2 className="text-base font-bold text-neutral-800">Novo trabalho</h2>
        <div className="space-y-1">
          <label htmlFor="assignment-title" className={LABEL_CLASSES}>
            Título
          </label>
          <input
            id="assignment-title"
            value={assignmentDraft.title}
            onChange={(event) =>
              setAssignmentDraft((draft) => ({
                ...draft,
                title: event.target.value,
              }))
            }
            aria-invalid={assignmentErrors.title ? true : undefined}
            aria-describedby={
              assignmentErrors.title ? "assignment-title-error" : undefined
            }
            className={INPUT_CLASSES}
          />
          {assignmentErrors.title && (
            <p id="assignment-title-error" className={FIELD_ERROR_CLASSES}>
              {assignmentErrors.title}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="assignment-due" className={LABEL_CLASSES}>
            Prazo de entrega
          </label>
          <input
            id="assignment-due"
            type="date"
            value={assignmentDraft.dueDate}
            onChange={(event) =>
              setAssignmentDraft((draft) => ({
                ...draft,
                dueDate: event.target.value,
              }))
            }
            aria-invalid={assignmentErrors.dueDate ? true : undefined}
            aria-describedby={
              assignmentErrors.dueDate ? "assignment-due-error" : undefined
            }
            className={INPUT_CLASSES}
          />
          {assignmentErrors.dueDate && (
            <p id="assignment-due-error" className={FIELD_ERROR_CLASSES}>
              {assignmentErrors.dueDate}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="assignment-description" className={LABEL_CLASSES}>
            Orientações <span className="font-normal">(opcional)</span>
          </label>
          <textarea
            id="assignment-description"
            rows={2}
            value={assignmentDraft.description}
            onChange={(event) =>
              setAssignmentDraft((draft) => ({
                ...draft,
                description: event.target.value,
              }))
            }
            aria-invalid={assignmentErrors.description ? true : undefined}
            aria-describedby={
              assignmentErrors.description
                ? "assignment-description-error"
                : undefined
            }
            className={INPUT_CLASSES}
          />
          {assignmentErrors.description && (
            <p
              id="assignment-description-error"
              className={FIELD_ERROR_CLASSES}
            >
              {assignmentErrors.description}
            </p>
          )}
        </div>
        <button type="submit" className={`${SECONDARY_BUTTON_CLASSES} w-full`}>
          <span className="material-symbols-outlined" aria-hidden="true">
            add
          </span>
          Cadastrar trabalho
        </button>
      </form>

      {selectedAssignment ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="assignment" className={LABEL_CLASSES}>
              Nota do trabalho
            </label>
            <select
              id="assignment"
              value={selectedAssignment.id}
              onChange={(event) => {
                setSelectedAssignmentId(event.target.value);
                setFeedback(null);
              }}
              className={INPUT_CLASSES}
            >
              {assignments.map((item) => {
                const [, month, day] = item.dueDate.split("-");
                return (
                  <option key={item.id} value={item.id}>
                    {item.title} (entrega {day}/{month})
                  </option>
                );
              })}
            </select>
            {selectedAssignment.description && (
              <p className="text-xs text-neutral-500">
                {selectedAssignment.description}
              </p>
            )}
          </div>
          <GradeEntryList
            students={diary.students}
            values={valuesFor(selectedAssignment.id)}
            maxGrade={ASSIGNMENT_MAX_GRADE}
            assessmentLabel={`Trabalho ${selectedAssignment.title}`}
            onChange={(enrollmentId, value) =>
              updateGrade(selectedAssignment.id, enrollmentId, value)
            }
          />
          <Feedback feedback={feedback} tab="assignments" />
          <button
            type="button"
            onClick={() =>
              saveGrades(
                "assignments",
                selectedAssignment.id,
                `Trabalho "${selectedAssignment.title}"`,
                ASSIGNMENT_MAX_GRADE,
              )
            }
            className={PRIMARY_BUTTON_CLASSES}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              check
            </span>
            Salvar notas do trabalho
          </button>
        </div>
      ) : (
        <>
          <Feedback feedback={feedback} tab="assignments" />
          <p className="text-center text-sm text-neutral-500">
            Nenhum trabalho cadastrado para o {diary.className} ainda.
          </p>
        </>
      )}
    </div>
  );

  const attendancePanel = (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="attendance-date" className={LABEL_CLASSES}>
            Data da aula
          </label>
          <input
            id="attendance-date"
            type="date"
            value={attendanceDate}
            max={today}
            onChange={(event) => {
              setAttendanceDate(event.target.value);
              setFeedback(null);
            }}
            className={INPUT_CLASSES}
          />
        </div>
        <button
          type="button"
          onClick={markAllPresent}
          className={SECONDARY_BUTTON_CLASSES}
        >
          Todos presentes
        </button>
      </div>
      <p className="text-sm text-neutral-600">
        {diary.students.length - absentIds.size} presentes · {absentIds.size}{" "}
        {absentIds.size === 1 ? "falta" : "faltas"}
      </p>
      <AttendanceList
        students={diary.students}
        absentIds={absentIds}
        onToggle={toggleAbsence}
      />
      <Feedback feedback={feedback} tab="attendance" />
      <button
        type="button"
        onClick={saveAttendance}
        className={PRIMARY_BUTTON_CLASSES}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          check
        </span>
        Salvar chamada
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-1">
          <label htmlFor="diary" className={LABEL_CLASSES}>
            Turma
          </label>
          <select
            id="diary"
            value={diary.id}
            onChange={(event) => changeDiary(event.target.value)}
            className={INPUT_CLASSES}
          >
            {diaries.map((item) => (
              <option key={item.id} value={item.id}>
                {item.subject} · {item.className}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="bimester" className={LABEL_CLASSES}>
            Bimestre
          </label>
          <select
            id="bimester"
            value={bimester}
            onChange={(event) => {
              setBimester(Number(event.target.value) as Bimester);
              setFeedback(null);
            }}
            className={INPUT_CLASSES}
          >
            {BIMESTERS.map((item) => (
              <option key={item} value={item}>
                {item}º
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs
        ariaLabel="Tipo de lançamento"
        defaultTabId={defaultTab}
        tabs={[
          { id: "grades", label: "Notas", content: gradesPanel },
          { id: "assignments", label: "Trabalhos", content: assignmentsPanel },
          { id: "attendance", label: "Faltas", content: attendancePanel },
        ]}
      />
    </div>
  );
}
