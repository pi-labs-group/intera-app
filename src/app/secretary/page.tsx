import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";
import { Tabs } from "@/components/ui/tabs";
import { getSecretaryOverview } from "@/server/services/secretary-service";
import { LegacyImportCard } from "./_components/legacy-import-card";

export const metadata: Metadata = {
  title: "Administração · Intera",
};

/** Linha de lista administrativa: título, detalhe e um valor à direita. */
function AdminRow({
  title,
  detail,
  value,
}: {
  title: string;
  detail: string;
  value?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="text-sm font-semibold text-neutral-800">{title}</p>
        <p className="text-xs text-neutral-500">{detail}</p>
      </div>
      {value && (
        <span className="text-sm font-bold text-neutral-700">{value}</span>
      )}
    </li>
  );
}

function AdminList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-surface px-4">
      {children}
    </ul>
  );
}

export default async function SecretaryPage() {
  const overview = await getSecretaryOverview();

  return (
    <div className="space-y-6">
      <PageHeading
        title="Administração"
        subtitle="Turmas, disciplinas, usuários e avaliações da escola."
      />

      <LegacyImportCard lastImport={overview.lastLegacyImport} />

      <ul className="grid grid-cols-2 gap-3">
        {overview.userGroups.map((group) => (
          <li key={group.label}>
            <Card className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <span className="material-symbols-outlined" aria-hidden="true">
                  {group.icon}
                </span>
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-800">
                  {group.count}
                </p>
                <p className="text-xs text-neutral-500">{group.label}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-neutral-800">Gerenciar</h2>
        {/* TODO (fase E): telas de cadastro e edição de cada item */}
        <Tabs
          ariaLabel="Cadastros da escola"
          tabs={[
            {
              id: "classes",
              label: "Turmas",
              content: (
                <AdminList>
                  {overview.classes.map((schoolClass) => (
                    <AdminRow
                      key={schoolClass.name}
                      title={schoolClass.name}
                      detail={`${schoolClass.shift} · ${schoolClass.diaryCount} diários`}
                      value={`${schoolClass.studentCount} alunos`}
                    />
                  ))}
                </AdminList>
              ),
            },
            {
              id: "subjects",
              label: "Disciplinas",
              content: (
                <AdminList>
                  {overview.subjects.map((subject) => (
                    <AdminRow
                      key={subject.code}
                      title={subject.name}
                      detail={`Código ${subject.code}`}
                    />
                  ))}
                </AdminList>
              ),
            },
            {
              id: "assessments",
              label: "Avaliações",
              content: (
                <AdminList>
                  {overview.assessmentTypes.map((assessmentType) => (
                    <AdminRow
                      key={assessmentType.code}
                      title={assessmentType.name}
                      detail={`Código ${assessmentType.code}`}
                      value={`${assessmentType.diaryCount} diários`}
                    />
                  ))}
                </AdminList>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
