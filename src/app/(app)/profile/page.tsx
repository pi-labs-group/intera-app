import Image from "next/image";

// TODO (fase E): substituir por dados reais
const STUDENT = {
  name: "Lucas Andrade",
  className: "9º A",
  enrollmentId: "20230045",
  photoUrl:
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
};

// TODO (fase E): substituir por dados reais
const GUARDIAN = {
  name: "Ana Andrade",
  relationship: "Mãe",
  phone: "+5511999990000",
};

// TODO (fase E): substituir por dados reais
const PEDAGOGICAL_SUPPORT = {
  professional: "Dra. Mariana Costa (Psicopedagoga)",
  summary:
    "Plano Individual de Acompanhamento (PIA) ativo com foco em rotina de estudos. Próximo encontro: 12/04.",
};

/** Bloco rotulado com um card branco interno; a cor do bloco indica o tipo de informação. */
function InfoSection({
  title,
  className,
  titleClassName,
  children,
}: {
  title: string;
  className: string;
  titleClassName: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`space-y-2 rounded-2xl p-4 ${className}`}>
      <h2 className={`text-xs font-bold uppercase ${titleClassName}`}>
        {title}
      </h2>
      <div className="rounded-xl bg-surface p-3">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Image
          src={STUDENT.photoUrl}
          alt={`Foto de ${STUDENT.name}`}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover ring-4 ring-neutral-100"
        />
        <h1 className="text-xl font-bold text-neutral-800">{STUDENT.name}</h1>
        <p className="text-xs font-semibold text-neutral-500">
          Turma {STUDENT.className} · ID: {STUDENT.enrollmentId}
        </p>
      </div>

      <InfoSection
        title="Responsável"
        className="bg-neutral-100"
        titleClassName="text-neutral-500"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-800">
              {GUARDIAN.name}
            </p>
            <p className="text-xs text-neutral-500">{GUARDIAN.relationship}</p>
          </div>
          <a
            href={`tel:${GUARDIAN.phone}`}
            aria-label={`Ligar para ${GUARDIAN.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              call
            </span>
          </a>
        </div>
      </InfoSection>

      <InfoSection
        title="Apoio Pedagógico"
        className="bg-warning-soft"
        titleClassName="text-warning-strong"
      >
        <div className="space-y-2">
          <p className="text-sm font-bold text-neutral-800">
            {PEDAGOGICAL_SUPPORT.professional}
          </p>
          <p className="text-xs text-neutral-600">
            {PEDAGOGICAL_SUPPORT.summary}
          </p>
        </div>
      </InfoSection>

      <div className="flex gap-3">
        {/* TODO (fase E): abrir seletor de alunos */}
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary bg-surface py-2 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            swap_horiz
          </span>
          Trocar de aluno
        </button>
        {/* TODO (fase E): logout via Supabase */}
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger bg-surface py-2 text-sm font-semibold text-danger-text hover:bg-danger-softer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            logout
          </span>
          Sair
        </button>
      </div>
    </div>
  );
}
