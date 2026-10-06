import { Badge, type BadgeVariant } from "./badge";
import { Card, type CardTone } from "./card";

export type NoticePriority = "urgente" | "aviso";

// Aviso comum é informativo, por isso neutro: verde sugeriria "concluído/sucesso".
const PRIORITY: Record<
  NoticePriority,
  { label: string; badge: BadgeVariant; tone: CardTone }
> = {
  urgente: { label: "Urgente", badge: "danger", tone: "danger" },
  aviso: { label: "Aviso", badge: "neutral", tone: "default" },
};

type NoticeCardProps = {
  /** `urgente` adiciona a barra lateral e a borda vermelhas; `aviso` usa o card padrão. */
  priority: NoticePriority;
  /** Data já formatada para exibição (ex.: "Hoje, 08:30"). */
  date: string;
  title: string;
  body: string;
  /** Quem publicou o comunicado (ex.: "Coordenação Pedagógica"). */
  author: string;
};

/**
 * Card de comunicado: badge de prioridade e data, título, texto e rodapé com o
 * autor. A prioridade sempre aparece em texto no badge, não só pela cor.
 */
export function NoticeCard({
  priority,
  date,
  title,
  body,
  author,
}: NoticeCardProps) {
  const { label, badge, tone } = PRIORITY[priority];
  const isUrgent = priority === "urgente";

  return (
    <Card
      tone={tone}
      className={`space-y-2 ${isUrgent ? "relative overflow-hidden" : ""}`}
    >
      {isUrgent && (
        <div
          className="absolute top-0 bottom-0 left-0 w-1.5 bg-danger"
          aria-hidden="true"
        />
      )}
      <div className="flex items-center justify-between">
        <Badge variant={badge}>{label}</Badge>
        <span className="text-xs text-neutral-500">{date}</span>
      </div>
      <h2 className="text-base font-bold text-neutral-800">{title}</h2>
      <p className="text-xs text-neutral-600">{body}</p>
      <p className="border-t border-neutral-100 pt-2 text-xs font-medium text-neutral-500">
        {author}
      </p>
    </Card>
  );
}
