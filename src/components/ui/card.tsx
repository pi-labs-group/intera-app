import Link from "next/link";

type CardProps = {
  children: React.ReactNode;
  /** Classes extras do conteúdo (layout interno: flex, gap, espaçamento). */
  className?: string;
  /** Quando presente, o card inteiro vira um link de navegação. */
  href?: string;
  /** Nome acessível do link, para quando o texto visível não basta. */
  ariaLabel?: string;
};

/**
 * Superfície base dos blocos de conteúdo. Com `href`, o card é envolvido por um
 * `next/link` real (nunca `div` com onClick), com anel de foco da marca.
 */
export function Card({ children, className = "", href, ariaLabel }: CardProps) {
  const card = (
    <div
      className={`rounded-2xl border border-neutral-100 bg-surface p-4 shadow-xs ${className}`}
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
