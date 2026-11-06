/**
 * Parâmetros da escola que ainda não foram confirmados. Ficam centralizados aqui
 * para que a confirmação mude um único arquivo. Ver "Decisões pendentes" em
 * docs/architecture.md.
 */

// PENDENTE: confirmar com a escola (D1). Valor do protótipo de telas
// ("Média para aprovação: 6,0").
/** Média mínima para aprovação; abaixo dela a nota fica na faixa "low". */
export const PASSING_GRADE = 6;

// PENDENTE: confirmar com a escola. Corte da faixa "ótimo" herdado da versão anterior.
/** A partir desta média a nota fica na faixa "high". */
export const HIGH_GRADE = 7;

// PENDENTE: confirmar com a escola (D5). Escolha do projeto, não norma legal:
// reduz a dedução de notas alheias em turmas pequenas.
/** Mínimo de notas lançadas para exibir a média da turma ao aluno e ao responsável. */
export const MIN_CLASS_SAMPLE = 5;

/** Escala usada quando o diário não define nota máxima (DiaryAssessment.maxGrade nulo). */
export const DEFAULT_MAX_GRADE = 10;
