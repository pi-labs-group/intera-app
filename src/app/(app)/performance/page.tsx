import { ComparedGradeRow } from "@/components/ui/compared-grade-row";
import { PageHeading } from "@/components/ui/page-heading";
import { SubjectGradeCard } from "@/components/ui/subject-grade-card";
import { describeComparison } from "@/lib/class-comparison";
import { requireRole } from "@/server/services/auth-service";
import {
  getStudentPerformance,
  type ComparedItem,
  type SubjectPerformance,
} from "@/server/services/student-service";

/** Média do bimestre mais recente que já foi lançada, se houver. */
function latestAverage(subject: SubjectPerformance): number | null {
  return (
    subject.bimesters.find((bimester) => bimester.average)?.average?.value ??
    null
  );
}

function ItemRows({ items }: { items: ComparedItem[] }) {
  return items.map((item) => (
    <ComparedGradeRow
      key={item.id}
      label={item.label}
      value={item.value}
      comparison={describeComparison(item.comparison)}
    />
  ));
}

export default async function PerformancePage() {
  const [user, performance] = await Promise.all([
    requireRole(["student", "guardian"]),
    getStudentPerformance(),
  ]);
  const firstName = performance.studentName.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeading
        title="Desempenho por matéria"
        subtitle={
          user.role === "guardian"
            ? `Acompanhe as notas e faltas de ${firstName} no ano letivo.`
            : "Acompanhe suas notas e faltas no ano letivo."
        }
      />
      {performance.className === null ? (
        <p className="text-center text-sm text-neutral-500">
          Nenhuma matrícula ativa no ano letivo atual.
        </p>
      ) : (
        <ul className="space-y-3">
          {performance.subjects.map((subject) => (
            <li key={subject.diaryId}>
              <SubjectGradeCard
                subject={subject.subject}
                icon={subject.icon}
                average={latestAverage(subject)}
                absences={subject.absences}
              >
                {subject.bimesters.length === 0 ? (
                  <p className="text-xs text-neutral-500">
                    Nenhuma nota lançada ainda.
                  </p>
                ) : (
                  subject.bimesters.map((bimester) => (
                    <section key={bimester.bimester} className="space-y-1">
                      <h3 className="text-xs font-bold text-neutral-600">
                        {bimester.bimester}º bimestre
                      </h3>
                      <ul className="divide-y divide-neutral-100">
                        {bimester.average && (
                          <ItemRows items={[bimester.average]} />
                        )}
                        <ItemRows items={bimester.assessments} />
                        <ItemRows items={bimester.assignments} />
                      </ul>
                    </section>
                  ))
                )}
              </SubjectGradeCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
