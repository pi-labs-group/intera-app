type PageHeadingProps = {
  title: string;
  subtitle?: string;
};

/** Título da tela (`<h1>`) com subtítulo opcional. */
export function PageHeading({ title, subtitle }: PageHeadingProps) {
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
      {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
    </div>
  );
}
