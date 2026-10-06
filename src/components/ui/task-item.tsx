import { Badge, type BadgeVariant } from "./badge";
import { Card } from "./card";

export type TaskStatus = "pendente" | "atrasada" | "entregue";

const STATUS_BADGE: Record<
  TaskStatus,
  { variant: BadgeVariant; label: string }
> = {
  pendente: { variant: "warning", label: "Pendente" },
  atrasada: { variant: "danger", label: "Atrasada" },
  entregue: { variant: "success", label: "Entregue" },
};

type TaskItemProps = {
  subject: string;
  title: string;
  status: TaskStatus;
  /** Prazo já formatado para exibição (ex.: "Hoje, 23:59"). */
  dueLabel: string;
  /**
   * Atividade adaptada (acessibilidade/inclusão). É uma característica, não um
   * estado, por isso a tag é neutra e não usa cor semântica.
   */
  isAdapted?: boolean;
};

/**
 * Card de atividade no modelo uniforme da marca: disciplina, título, badge de
 * estado, prazo e, se for o caso, a tag de atividade adaptada.
 */
export function TaskItem({
  subject,
  title,
  status,
  dueLabel,
  isAdapted = false,
}: TaskItemProps) {
  const badge = STATUS_BADGE[status];

  return (
    <Card tone="brand" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-primary uppercase">
            {subject}
          </span>
          <h2 className="text-base font-bold text-neutral-800">{title}</h2>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">Prazo: {dueLabel}</span>
        {isAdapted && (
          <Badge variant="neutral">
            <span aria-hidden="true">★ </span>Atividade Adaptada
          </Badge>
        )}
      </div>
    </Card>
  );
}
