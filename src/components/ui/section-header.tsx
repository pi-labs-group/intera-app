import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  /** Ação opcional à direita, como "VER TODAS". */
  action?: {
    label: string;
    href: string;
    /** Nome acessível completo, já que rótulos como "VER TODAS" são vagos fora de contexto. */
    ariaLabel?: string;
  };
};

/** Título de seção (`<h2>`) com um link de ação opcional alinhado à direita. */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-neutral-800">{title}</h2>
      {action && (
        <Link
          href={action.href}
          aria-label={action.ariaLabel}
          className="rounded text-xs font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
