export type BadgeVariant = "danger" | "warning" | "success" | "neutral";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  danger: "bg-danger-soft text-danger-strong",
  warning: "bg-warning-soft text-warning-strong",
  success: "bg-success-soft text-success-strong",
  neutral: "bg-neutral-100 text-neutral-700",
};

type BadgeProps = {
  variant: BadgeVariant;
  /** Rótulo em texto, obrigatório: a cor nunca é o único sinal do estado. */
  children: React.ReactNode;
};

/**
 * Pílula de estado/prioridade. As variantes usam o par soft + strong de cada cor
 * de estado, que passa no contraste AA.
 */
export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
