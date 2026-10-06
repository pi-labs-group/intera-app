import { Card } from "./card";

export type DeadlineUrgency = "danger" | "warning" | "primary";

const URGENCY: Record<DeadlineUrgency, { bar: string; srLabel: string }> = {
  danger: { bar: "bg-danger", srLabel: "Urgência alta" },
  warning: { bar: "bg-warning", srLabel: "Urgência média" },
  primary: { bar: "bg-primary", srLabel: "Urgência baixa" },
};

type DeadlineItemProps = {
  title: string;
  subject: string;
  /** Data curta exibida (ex.: "15/10"). */
  date: string;
  /**
   * Prazo relativo (ex.: "Amanhã", "Em 4 dias"). Obrigatório porque é o sinal em
   * texto da urgência; a barra colorida sozinha não basta.
   */
  relativeLabel: string;
  /** Cor da barra lateral; `danger` também destaca a data. */
  urgency: DeadlineUrgency;
  href?: string;
};

/**
 * Linha de prazo: card com barra lateral de urgência, título, disciplina, data e
 * prazo relativo. Usada na Home e na tela de Atividades.
 */
export function DeadlineItem({
  title,
  subject,
  date,
  relativeLabel,
  urgency,
  href,
}: DeadlineItemProps) {
  const { bar, srLabel } = URGENCY[urgency];

  return (
    <Card
      href={href}
      className="relative flex items-center justify-between overflow-hidden"
    >
      <div
        className={`absolute top-0 bottom-0 left-0 w-1.5 ${bar}`}
        aria-hidden="true"
      />
      <div className="pl-2">
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        <p className="text-xs text-neutral-500">{subject}</p>
      </div>
      <div className="text-right">
        <span className="sr-only">{srLabel}: </span>
        <span
          className={`block text-sm font-bold ${urgency === "danger" ? "text-danger-text" : "text-neutral-700"}`}
        >
          {date}
        </span>
        <span className="block text-xs text-neutral-500">{relativeLabel}</span>
      </div>
    </Card>
  );
}
