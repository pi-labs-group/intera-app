import Image from "next/image";
import { logout } from "@/app/login/actions";
import {
  MOCK_GUARDIAN as GUARDIAN,
  MOCK_STUDENT as STUDENT,
  requireRole,
} from "@/server/services/auth-service";

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

/** Avatar com iniciais, para perfis ainda sem foto. */
function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      aria-hidden="true"
      className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-soft text-3xl font-bold text-primary ring-4 ring-neutral-100"
    >
      {initials}
    </div>
  );
}

/**
 * Perfil da sessão. Responsável e aluno acessam as mesmas informações, mas o
 * destaque muda: o responsável aparece no topo com o aluno vinculado abaixo; o
 * aluno aparece no topo com o contato do responsável abaixo.
 */
export default async function ProfilePage() {
  const user = await requireRole(["student", "guardian"]);
  const isGuardian = user.role === "guardian";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        {isGuardian ? (
          <InitialsAvatar name={GUARDIAN.name} />
        ) : (
          <Image
            src={STUDENT.photoUrl}
            alt={`Foto de ${STUDENT.name}`}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-neutral-100"
          />
        )}
        <h1 className="text-xl font-bold text-neutral-800">{user.name}</h1>
        <p className="text-xs font-semibold text-neutral-500">
          {isGuardian
            ? `Responsável · ${GUARDIAN.relationship}`
            : `Turma ${STUDENT.className} · ID: ${STUDENT.enrollmentId}`}
        </p>
      </div>

      {isGuardian ? (
        <InfoSection
          title="Aluno vinculado"
          className="bg-neutral-100"
          titleClassName="text-neutral-500"
        >
          <div className="flex items-center gap-3">
            <Image
              src={STUDENT.photoUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-bold text-neutral-800">
                {STUDENT.name}
              </p>
              <p className="text-xs text-neutral-500">
                Turma {STUDENT.className} · ID: {STUDENT.enrollmentId}
              </p>
            </div>
          </div>
        </InfoSection>
      ) : (
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
              <p className="text-xs text-neutral-500">
                {GUARDIAN.relationship}
              </p>
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
      )}

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
        {isGuardian && (
          // TODO (fase E): abrir seletor de alunos
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary bg-surface py-2 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              swap_horiz
            </span>
            Trocar de aluno
          </button>
        )}
        <form action={logout} className="flex flex-1">
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger bg-surface py-2 text-sm font-semibold text-danger-text hover:bg-danger-softer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              logout
            </span>
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
