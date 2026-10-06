import { Card } from "./card";

export type MetricTone = "primary" | "success" | "danger";

const ICON_TONE_CLASSES: Record<MetricTone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger-text",
};

type MetricCardProps = {
  /** Nome do ícone Material Symbols Outlined. */
  icon: string;
  value: string;
  label: string;
  /**
   * Cor do círculo do ícone. `danger` também pinta o valor, para indicadores que
   * pedem atenção (ex.: atividades pendentes).
   */
  tone: MetricTone;
  /** Quando presente, o card vira link para a tela de detalhe. */
  href?: string;
  /** Nome acessível do link (ex.: "Média geral 6,8. Ver desempenho"). */
  ariaLabel?: string;
};

/** Indicador resumido: ícone em círculo colorido, valor em destaque e rótulo. */
export function MetricCard({
  icon,
  value,
  label,
  tone,
  href,
  ariaLabel,
}: MetricCardProps) {
  return (
    <Card
      href={href}
      ariaLabel={ariaLabel}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${ICON_TONE_CLASSES[tone]}`}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {icon}
        </span>
      </div>
      <span
        className={`text-xl font-bold ${tone === "danger" ? "text-danger-text" : "text-neutral-800"}`}
      >
        {value}
      </span>
      <span className="text-xs text-neutral-500">{label}</span>
    </Card>
  );
}
