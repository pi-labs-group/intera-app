import Link from "next/link";

export type CardTone = "default" | "brand" | "danger";

const TONE_CLASSES: Record<CardTone, string> = {
  default: "border-neutral-100 bg-surface",
  brand: "border-primary-border bg-surface",
  danger: "border-danger-border bg-surface",
};

type CardProps = {
  children: React.ReactNode;
  /** Classes extras do conteúdo (layout interno: flex, gap, espaçamento). */
  className?: string;
  /**
   * Fundo e borda. `brand` (fundo `surface`, borda `primary-border`) é o modelo
   * uniforme dos cards de atividade; `danger` (borda `danger-border`) marca
   * conteúdo urgente.
   */
  tone?: CardTone;
  /** Quando presente, o card inteiro vira um link de navegação. */
  href?: string;
  /** Nome acessível do link, para quando o texto visível não basta. */
  ariaLabel?: string;
};

/**
 * Superfície base dos blocos de conteúdo. Com `href`, o card é envolvido por um
 * `next/link` real (nunca `div` com onClick), com anel de foco da marca.
 */
export function Card({
  children,
  className = "",
  tone = "default",
  href,
  ariaLabel,
}: CardProps) {
  const card = (
    <div
      className={`rounded-2xl border p-4 shadow-xs ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </div>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {card}
    </Link>
  );
}
