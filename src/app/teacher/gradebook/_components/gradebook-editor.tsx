"use client";

import { useState, useTransition } from "react";
import {
  FIELD_ERROR_CLASSES,
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
  SECONDARY_BUTTON_CLASSES,
} from "@/components/ui/form-classes";
import { Tabs } from "@/components/ui/tabs";
import { averageOf, describeTeacherClassAverage } from "@/lib/class-comparison";
import {
  LESSON_NUMBERS,
  assignmentGradeKey,
  attendanceKey,
  gradeKey,
} from "@/lib/gradebook";
import { assignmentSchema, parseGrade } from "@/lib/validation/teacher";
import type {
  Assignment,
  Bimester,
  Diary,
  DiaryStudent,
  LessonNumber,
} from "@/types/school";
import {
  createAssignment,
  saveAssessmentGrades,
  saveAssignmentGrades,
  saveAttendance,
  type ActionResult,
} from "../actions";
import { AttendanceList } from "./attendance-list";
import { GradeEntryList } from "./grade-entry-list";

export type GradebookTab = "grades" | "assignments" | "attendance";

type GradebookEditorProps = {
  /** Diários do professor; a página trata o caso sem nenhum diário. */
  diaries: [Diary, ...Diary[]];
  /** Data de hoje (AAAA-MM-DD) calculada no servidor, para evitar divergência de fuso na hidratação. */
  today: string;
  /** Bimestre em vigor, pelo calendário cadastrado; é o aberto inicialmente. */
  currentBimester: Bimester;
  defaultTab?: GradebookTab;
  /** Notas já lançadas, no formato de `gradeKey`. */
  initialGrades: Record<string, string>;
  /** Notas de trabalho já lançadas, no formato de `assignmentGradeKey`. */
  initialAssignmentGrades: Record<string, string>;
  /** Faltas já registradas, por `attendanceKey`. */
  initialAbsences: Record<string, string[]>;
};

const BIMESTERS: Bimester[] = [1, 2, 3, 4];

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
 * Média dos valores válidos digitados, calculada no cliente. Para o professor
 * não há mínimo de amostra: ele já vê todas as notas.
 */
function ClassAverageNote({
  students,
  values,
  maxGrade,
}: {
  students: DiaryStudent[];
  values: Record<string, string>;
  maxGrade: number;
}) {
  const validValues = students.flatMap((student) => {
    const result = parseGrade(values[student.enrollmentId] ?? "", maxGrade);
    return result.ok && result.value !== null ? [result.value] : [];
  });
  return (
    <p className="text-sm text-neutral-600">
      {describeTeacherClassAverage(averageOf(validValues), students.length)}
    </p>
  );
}

/**
 * Editor do diário do professor: escolhe turma e bimestre e lança notas de
 * avaliações, trabalhos e faltas. Salvar chama as Server Actions, que revalidam
 * tudo no servidor; a validação daqui só adianta o aviso ao professor.
 */
export function GradebookEditor({
  diaries,
  today,
  currentBimester,
  defaultTab,
  initialGrades,
  initialAssignmentGrades,
  initialAbsences,
}: GradebookEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [diaryId, setDiaryId] = useState(diaries[0].id);
  const [bimester, setBimester] = useState<Bimester>(currentBimester);
  const [grades, setGrades] = useState(initialGrades);
  const [assignmentGrades, setAssignmentGrades] = useState(
    initialAssignmentGrades,
  );
  const [feedback, setFeedback] = useState<SaveFeedback>(null);

  const [assessmentId, setAssessmentId] = useState(
    diaries[0].assessments[0]?.id ?? "",
  );

  const [assignmentsByDiary, setAssignmentsByDiary] = useState<
    Record<string, Assignment[]>
  >(() =>
    Object.fromEntries(diaries.map((diary) => [diary.id, diary.assignments])),
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [assignmentDraft, setAssignmentDraft] = useState({
    title: "",
    dueDate: today,
    description: "",
  });
  const [assignmentErrors, setAssignmentErrors] = useState<
    Partial<Record<"title" | "dueDate" | "description", string>>
  >({});

  const [attendanceDate, setAttendanceDate] = useState(today);
  const [lessonNumber, setLessonNumber] = useState<LessonNumber>(1);
  /** Faltas por `attendanceKey`, para cada chamada guardar a sua marcação. */
  const [absences, setAbsences] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(
      Object.entries(initialAbsences).map(([key, ids]) => [key, new Set(ids)]),
    ),
  );

  const diary = diaries.find((item) => item.id === diaryId) ?? diaries[0];

  const assessment =
    diary.assessments.find((item) => item.id === assessmentId) ??
    diary.assessments[0];
  // Só os trabalhos do bimestre selecionado.
  const assignments = (assignmentsByDiary[diary.id] ?? []).filter(
    (item) => item.bimester === bimester,
  );
  const selectedAssignment =
    assignments.find((item) => item.id === selectedAssignmentId) ??
    assignments[0];
  const currentAttendanceKey = attendanceKey(
    diary.id,
    attendanceDate,
    lessonNumber,
  );
  const absentIds = absences[currentAttendanceKey] ?? new Set<string>();

  function changeDiary(nextDiaryId: string) {
    const nextDiary = diaries.find((item) => item.id === nextDiaryId);
    setDiaryId(nextDiaryId);
    setAssessmentId(nextDiary?.assessments[0]?.id ?? "");
    setSelectedAssignmentId("");
    setFeedback(null);
  }

  /** Valores digitados de uma avaliação no bimestre, indexados por matrícula. */
  function assessmentValues(evaluationId: string): Record<string, string> {
    return Object.fromEntries(
      diary.students.map((student) => [
        student.enrollmentId,
        grades[
          gradeKey(diary.id, bimester, evaluationId, student.enrollmentId)
        ] ?? "",
      ]),
    );
  }

  /** Valores digitados de um trabalho, indexados por matrícula. */
  function assignmentValues(assignmentId: string): Record<string, string> {
    return Object.fromEntries(
      diary.students.map((student) => [
        student.enrollmentId,
        assignmentGrades[
          assignmentGradeKey(assignmentId, student.enrollmentId)
        ] ?? "",
      ]),
    );
  }

  /** Conta as notas inválidas; se houver, avisa e impede o envio. */
  function rejectInvalid(
    tab: GradebookTab,
    values: Record<string, string>,
    maxGrade: number,
  ): boolean {
    const invalidCount = Object.values(values).filter(
      (raw) => !parseGrade(raw, maxGrade).ok,
    ).length;
    if (invalidCount === 0) return false;
    setFeedback({
      tab,
      tone: "error",
      message: `Corrija ${invalidCount} ${invalidCount === 1 ? "nota inválida" : "notas inválidas"} antes de salvar.`,
    });
    return true;
  }

  function showResult(tab: GradebookTab, result: ActionResult<unknown>) {
    setFeedback({
      tab,
      tone: result.ok ? "success" : "error",
      message: result.message,
    });
  }

  function toBatch(values: Record<string, string>) {
    return Object.entries(values).map(([enrollmentId, raw]) => ({
      enrollmentId,
      raw,
    }));
  }

  function saveAssessment() {
    if (!assessment) return;
    const values = assessmentValues(assessment.id);
    if (rejectInvalid("grades", values, assessment.maxGrade)) return;
    startTransition(async () => {
      const result = await saveAssessmentGrades({
        diaryId: diary.id,
        bimester,
        assessmentTypeId: assessment.id,
        assessmentName: assessment.name,
        grades: toBatch(values),
      });
      showResult("grades", result);
    });
  }

  function saveSelectedAssignment() {
    if (!selectedAssignment) return;
    const values = assignmentValues(selectedAssignment.id);
    if (rejectInvalid("assignments", values, selectedAssignment.maxGrade)) {
      return;
    }
    startTransition(async () => {
      const result = await saveAssignmentGrades({
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        grades: toBatch(values),
      });
      showResult("assignments", result);
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

    const targetDiaryId = diary.id;
    startTransition(async () => {
      const result = await createAssignment({
        ...parsed.data,
        diaryId: targetDiaryId,
        bimester,
      });
      if (!result.ok) {
        setAssignmentErrors(result.fieldErrors ?? {});
        showResult("assignments", result);
        return;
      }
      setAssignmentsByDiary((current) => ({
        ...current,
        [targetDiaryId]: [...(current[targetDiaryId] ?? []), result.data],
      }));
      setSelectedAssignmentId(result.data.id);
      setAssignmentDraft({ title: "", dueDate: today, description: "" });
      setAssignmentErrors({});
      showResult("assignments", result);
    });
  }

  function toggleAbsence(enrollmentId: string) {
    setAbsences((current) => {
      const next = new Set(current[currentAttendanceKey] ?? []);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return { ...current, [currentAttendanceKey]: next };
    });
    setFeedback(null);
  }

  function markAllPresent() {
    setAbsences((current) => ({
      ...current,
      [currentAttendanceKey]: new Set(),
    }));
    setFeedback(null);
  }

  function submitAttendance() {
    startTransition(async () => {
      const result = await saveAttendance({
        diaryId: diary.id,
        date: attendanceDate,
        lessonNumber,
        absentEnrollmentIds: [...absentIds],
      });
      showResult("attendance", result);
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
        values={assessmentValues(assessment.id)}
        maxGrade={assessment.maxGrade}
        assessmentLabel={assessment.name}
        onChange={(enrollmentId, value) => {
          setGrades((current) => ({
            ...current,
            [gradeKey(diary.id, bimester, assessment.id, enrollmentId)]: value,
          }));
          setFeedback(null);
        }}
      />
      <ClassAverageNote
        students={diary.students}
        values={assessmentValues(assessment.id)}
        maxGrade={assessment.maxGrade}
      />
      <Feedback feedback={feedback} tab="grades" />
      <button
        type="button"
        onClick={saveAssessment}
        disabled={isPending}
        className={PRIMARY_BUTTON_CLASSES}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          check
        </span>
        {isPending ? "Salvando…" : "Salvar notas"}
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
        <h2 className="text-base font-bold text-neutral-800">
          Novo trabalho · {bimester}º bimestre
        </h2>
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
        <button
          type="submit"
          disabled={isPending}
          className={`${SECONDARY_BUTTON_CLASSES} w-full`}
        >
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
            values={assignmentValues(selectedAssignment.id)}
            maxGrade={selectedAssignment.maxGrade}
            assessmentLabel={`Trabalho ${selectedAssignment.title}`}
            onChange={(enrollmentId, value) => {
              setAssignmentGrades((current) => ({
                ...current,
                [assignmentGradeKey(selectedAssignment.id, enrollmentId)]:
                  value,
              }));
              setFeedback(null);
            }}
          />
          <ClassAverageNote
            students={diary.students}
            values={assignmentValues(selectedAssignment.id)}
            maxGrade={selectedAssignment.maxGrade}
          />
          <Feedback feedback={feedback} tab="assignments" />
          <button
            type="button"
            onClick={saveSelectedAssignment}
            disabled={isPending}
            className={PRIMARY_BUTTON_CLASSES}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              check
            </span>
            {isPending ? "Salvando…" : "Salvar notas do trabalho"}
          </button>
        </div>
      ) : (
        <>
          <Feedback feedback={feedback} tab="assignments" />
          <p className="text-center text-sm text-neutral-500">
            Nenhum trabalho cadastrado para o {diary.className} no {bimester}º
            bimestre ainda.
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
        <div className="space-y-1">
          <label htmlFor="attendance-lesson" className={LABEL_CLASSES}>
            Aula
          </label>
          <select
            id="attendance-lesson"
            value={lessonNumber}
            onChange={(event) => {
              setLessonNumber(Number(event.target.value) as LessonNumber);
              setFeedback(null);
            }}
            className={INPUT_CLASSES}
          >
            {LESSON_NUMBERS.map((item) => (
              <option key={item} value={item}>
                {item}ª
              </option>
            ))}
          </select>
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
        onClick={submitAttendance}
        disabled={isPending}
        className={PRIMARY_BUTTON_CLASSES}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          check
        </span>
        {isPending ? "Salvando…" : "Salvar chamada"}
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
              setSelectedAssignmentId("");
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
