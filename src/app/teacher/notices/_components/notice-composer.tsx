"use client";

import { useState } from "react";
import {
  FIELD_ERROR_CLASSES,
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
} from "@/components/ui/form-classes";
import { NoticeCard, type NoticePriority } from "@/components/ui/notice-card";
import { noticeSchema, type NoticeInput } from "@/lib/validation/teacher";
import type { Diary } from "@/types/school";

export type PublishedNotice = {
  id: string;
  diaryId: string;
  priority: NoticePriority;
  title: string;
  body: string;
  /** Data já formatada para exibição (ex.: "Hoje, 08:30"). */
  date: string;
};

type DiaryOption = Pick<Diary, "id" | "subject" | "className">;

type NoticeComposerProps = {
  diaries: DiaryOption[];
  /** Assinatura exibida no rodapé do aviso (ex.: "Prof. Renato (Matemática)"). */
  author: string;
  initialNotices: PublishedNotice[];
};

type FieldErrors = Partial<Record<keyof NoticeInput, string>>;

const PRIORITY_OPTIONS: { value: NoticePriority; label: string }[] = [
  { value: "aviso", label: "Aviso" },
  { value: "urgente", label: "Urgente" },
];

/**
 * Formulário de aviso vinculado a um diário (turma + matéria) e lista dos avisos
 * já publicados. Publicar só atualiza a lista local: sem banco de dados, o aviso
 * ainda não chega às telas de aluno e responsável.
 *
 * TODO (fase E): publicar via Server Action e notificar a turma (módulo de alertas).
 */
export function NoticeComposer({
  diaries,
  author,
  initialNotices,
}: NoticeComposerProps) {
  const emptyDraft: NoticeInput = {
    diaryId: diaries[0]?.id ?? "",
    priority: "aviso",
    title: "",
    body: "",
  };
  const [draft, setDraft] = useState<NoticeInput>(emptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notices, setNotices] = useState(initialNotices);
  const [confirmation, setConfirmation] = useState("");

  function classLabel(diaryId: string): string {
    const diary = diaries.find((item) => item.id === diaryId);
    return diary ? `${diary.subject} · ${diary.className}` : "Turma removida";
  }

  function updateDraft<Field extends keyof NoticeInput>(
    field: Field,
    value: NoticeInput[Field],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setConfirmation("");
  }

  function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = noticeSchema.safeParse(draft);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof NoticeInput;
        nextErrors[field] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    const notice: PublishedNotice = {
      id: `aviso-${Date.now()}`,
      ...parsed.data,
      date: "Agora",
    };
    setNotices((current) => [notice, ...current]);
    setDraft({ ...emptyDraft, diaryId: parsed.data.diaryId });
    setErrors({});
    setConfirmation(
      `Aviso publicado para ${classLabel(notice.diaryId)} (simulação, sem banco de dados).`,
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={publish}
        noValidate
        className="space-y-3 rounded-2xl border border-primary-border bg-surface p-4"
      >
        <h2 className="text-base font-bold text-neutral-800">Novo aviso</h2>

        <div className="space-y-1">
          <label htmlFor="notice-diary" className={LABEL_CLASSES}>
            Turma
          </label>
          <select
            id="notice-diary"
            value={draft.diaryId}
            onChange={(event) => updateDraft("diaryId", event.target.value)}
            aria-invalid={errors.diaryId ? true : undefined}
            className={INPUT_CLASSES}
          >
            {diaries.map((diary) => (
              <option key={diary.id} value={diary.id}>
                {diary.subject} · {diary.className}
              </option>
            ))}
          </select>
          {errors.diaryId && (
            <p className={FIELD_ERROR_CLASSES}>{errors.diaryId}</p>
          )}
        </div>

        <fieldset className="space-y-1">
          <legend className={LABEL_CLASSES}>Prioridade</legend>
          <div className="flex gap-2 pt-1">
            {PRIORITY_OPTIONS.map((option) => {
              const isSelected = draft.priority === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex-1 cursor-pointer rounded-xl border py-2 text-center text-sm font-semibold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
                    isSelected
                      ? "border-primary bg-primary-softer text-primary"
                      : "border-neutral-200 bg-surface text-neutral-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => updateDraft("priority", option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-1">
          <label htmlFor="notice-title" className={LABEL_CLASSES}>
            Título
          </label>
          <input
            id="notice-title"
            value={draft.title}
            onChange={(event) => updateDraft("title", event.target.value)}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "notice-title-error" : undefined}
            className={INPUT_CLASSES}
          />
          {errors.title && (
            <p id="notice-title-error" className={FIELD_ERROR_CLASSES}>
              {errors.title}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="notice-body" className={LABEL_CLASSES}>
            Mensagem
          </label>
          <textarea
            id="notice-body"
            rows={4}
            value={draft.body}
            onChange={(event) => updateDraft("body", event.target.value)}
            aria-invalid={errors.body ? true : undefined}
            aria-describedby={errors.body ? "notice-body-error" : undefined}
            className={INPUT_CLASSES}
          />
          {errors.body && (
            <p id="notice-body-error" className={FIELD_ERROR_CLASSES}>
              {errors.body}
            </p>
          )}
        </div>

        <div role="status" aria-live="polite">
          {confirmation && (
            <p className="rounded-xl bg-success-soft px-3 py-2 text-sm font-medium text-success-strong">
              {confirmation}
            </p>
          )}
        </div>

        <button type="submit" className={PRIMARY_BUTTON_CLASSES}>
          <span className="material-symbols-outlined" aria-hidden="true">
            send
          </span>
          Publicar aviso
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-neutral-800">
          Avisos publicados
        </h2>
        {notices.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">
            Nenhum aviso publicado ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {notices.map((notice) => (
              <li key={notice.id}>
                <NoticeCard
                  priority={notice.priority}
                  date={notice.date}
                  title={notice.title}
                  body={notice.body}
                  author={`${author} · ${classLabel(notice.diaryId)}`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
