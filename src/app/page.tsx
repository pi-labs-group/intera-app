/**
 * Página TEMPORÁRIA de pré-visualização dos design tokens (somente desenvolvimento).
 * Serve para conferir visualmente a paleta, a tipografia e os ícones definidos em
 * `globals.css`. Será substituída pela home real na etapa D1.
 *
 * Os HEX exibidos são apenas rótulos; a cor de cada amostra vem da utility do
 * Tailwind gerada pelo `@theme` (classes completas para o Tailwind detectá-las).
 */

type Swatch = {
  token: string;
  hex: string;
  className: string;
};

type SwatchGroup = {
  title: string;
  swatches: Swatch[];
};

const SWATCH_GROUPS: SwatchGroup[] = [
  {
    title: "Marca",
    swatches: [
      { token: "primary", hex: "#0B4A54", className: "bg-primary" },
      { token: "primary-hover", hex: "#07363E", className: "bg-primary-hover" },
      { token: "primary-soft", hex: "#D8EAEA", className: "bg-primary-soft" },
      {
        token: "primary-softer",
        hex: "#EDF5F4",
        className: "bg-primary-softer",
      },
      {
        token: "primary-border",
        hex: "#BCDADA",
        className: "bg-primary-border",
      },
    ],
  },
  {
    title: "Superfícies e neutros",
    swatches: [
      { token: "background", hex: "#F6F8F8", className: "bg-background" },
      { token: "surface", hex: "#FFFFFF", className: "bg-surface" },
      { token: "neutral-50", hex: "#F7F9F9", className: "bg-neutral-50" },
      { token: "neutral-100", hex: "#EDF1F1", className: "bg-neutral-100" },
      { token: "neutral-200", hex: "#DFE5E5", className: "bg-neutral-200" },
      { token: "neutral-300", hex: "#C8D0D1", className: "bg-neutral-300" },
      { token: "neutral-400", hex: "#98A3A5", className: "bg-neutral-400" },
      { token: "neutral-500", hex: "#5F6B6E", className: "bg-neutral-500" },
      { token: "neutral-600", hex: "#4C5759", className: "bg-neutral-600" },
      { token: "neutral-700", hex: "#394244", className: "bg-neutral-700" },
      { token: "neutral-800", hex: "#242B2D", className: "bg-neutral-800" },
      { token: "neutral-900", hex: "#151A1B", className: "bg-neutral-900" },
    ],
  },
  {
    title: "Estado",
    swatches: [
      { token: "danger", hex: "#C0472E", className: "bg-danger" },
      { token: "danger-text", hex: "#A63A23", className: "bg-danger-text" },
      { token: "danger-strong", hex: "#872E1B", className: "bg-danger-strong" },
      { token: "danger-soft", hex: "#F6DDD6", className: "bg-danger-soft" },
      { token: "danger-softer", hex: "#FBF0EC", className: "bg-danger-softer" },
      { token: "danger-border", hex: "#EBBFB4", className: "bg-danger-border" },
      { token: "warning", hex: "#C48610", className: "bg-warning" },
      { token: "warning-text", hex: "#9C6808", className: "bg-warning-text" },
      {
        token: "warning-strong",
        hex: "#684504",
        className: "bg-warning-strong",
      },
      { token: "warning-soft", hex: "#F6E7C4", className: "bg-warning-soft" },
      { token: "success", hex: "#3F6A20", className: "bg-success" },
      {
        token: "success-strong",
        hex: "#31541A",
        className: "bg-success-strong",
      },
      { token: "success-soft", hex: "#E2EDD4", className: "bg-success-soft" },
    ],
  },
  {
    title: "Escala de notas",
    swatches: [
      { token: "grade-low", hex: "#E5392B", className: "bg-grade-low" },
      {
        token: "grade-low-text",
        hex: "#C22A1E",
        className: "bg-grade-low-text",
      },
      { token: "grade-mid", hex: "#F0A91A", className: "bg-grade-mid" },
      {
        token: "grade-mid-text",
        hex: "#9A6700",
        className: "bg-grade-mid-text",
      },
      { token: "grade-high", hex: "#2FA84F", className: "bg-grade-high" },
      {
        token: "grade-high-text",
        hex: "#1E7F3C",
        className: "bg-grade-high-text",
      },
    ],
  },
];

const FONT_WEIGHTS = [
  { label: "Regular (400)", className: "font-normal" },
  { label: "Medium (500)", className: "font-medium" },
  { label: "Semibold (600)", className: "font-semibold" },
  { label: "Bold (700)", className: "font-bold" },
  { label: "Extrabold (800)", className: "font-extrabold" },
];

const ICONS = [
  "home",
  "monitoring",
  "assignment",
  "notifications",
  "person",
  "menu",
  "close",
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <header className="mb-10">
        <p className="text-sm font-medium text-neutral-500">
          Pré-visualização temporária
        </p>
        <h1 className="text-3xl font-bold text-neutral-900">
          Design tokens do Intera
        </h1>
        <p className="mt-2 max-w-prose text-neutral-600">
          Paleta, tipografia e ícones definidos em <code>globals.css</code>.
          Esta página será substituída pela home real.
        </p>
      </header>

      {SWATCH_GROUPS.map((group) => (
        <section key={group.title} className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-neutral-800">
            {group.title}
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {group.swatches.map((swatch) => (
              <li key={swatch.token}>
                <div
                  className={`h-16 rounded-xl border border-neutral-200 ${swatch.className}`}
                />
                <p className="mt-2 text-sm font-medium text-neutral-800">
                  {swatch.token}
                </p>
                <p className="text-xs text-neutral-500">{swatch.hex}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-neutral-800">
          Tipografia — Inter
        </h2>
        <ul className="space-y-2 border-t border-neutral-200 pt-4">
          {FONT_WEIGHTS.map((weight) => (
            <li key={weight.label} className={`text-xl ${weight.className}`}>
              {weight.label} — A rotina escolar reunida em um só lugar.
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-neutral-800">
          Ícones — Material Symbols Outlined
        </h2>
        <ul className="flex flex-wrap gap-6 border-t border-neutral-200 pt-4">
          {ICONS.map((icon) => (
            <li key={icon} className="flex flex-col items-center gap-1">
              <span
                className="material-symbols-outlined text-primary"
                aria-hidden="true"
              >
                {icon}
              </span>
              <span className="text-xs text-neutral-500">{icon}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
