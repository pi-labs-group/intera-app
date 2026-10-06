type LogoProps = {
  /** Tamanho e posicionamento (ex.: "h-9 w-9"). */
  className?: string;
};

/**
 * Logo da escola. As cores são da identidade visual da escola (conteúdo), não
 * tokens da paleta do Intera — por isso ficam fixas e não seguem o petróleo.
 * Decorativo (`aria-hidden`): o nome da escola deve aparecer em texto ao lado.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path
        d="M 50 12 A 38 38 0 0 1 85 62 A 38 38 0 0 1 50 88 A 36 36 0 0 0 74 38 Z"
        fill="#e11d48"
      />
      <path
        d="M 50 88 A 38 38 0 0 1 15 38 A 38 38 0 0 1 50 12 A 36 36 0 0 0 26 62 Z"
        fill="#16a34a"
      />
      <circle cx="50" cy="38" r="7" fill="#21358f" />
      <rect x="44" y="50" width="12" height="24" rx="6" fill="#21358f" />
    </svg>
  );
}
