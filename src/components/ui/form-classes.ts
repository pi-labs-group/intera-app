/**
 * Classes compartilhadas dos controles de formulário, para que inputs, selects e
 * botões tenham a mesma borda, foco e estado de erro em todas as telas.
 * `aria-invalid` pinta a borda de erro; a mensagem em texto continua obrigatória.
 */

export const INPUT_CLASSES =
  "w-full rounded-xl border border-neutral-300 bg-surface px-3 py-2.5 text-sm text-neutral-900 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary aria-invalid:border-danger";

export const LABEL_CLASSES = "text-sm font-semibold text-neutral-800";

export const FIELD_ERROR_CLASSES = "text-xs text-danger-text";

export const PRIMARY_BUTTON_CLASSES =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70";

export const SECONDARY_BUTTON_CLASSES =
  "flex items-center justify-center gap-2 rounded-xl border border-primary bg-surface px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-softer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
