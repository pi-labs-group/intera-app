import { PageHeading } from "@/components/ui/page-heading";
import { SubjectGradeCard } from "@/components/ui/subject-grade-card";
import {
  MOCK_STUDENT as STUDENT,
  requireRole,
} from "@/server/services/auth-service";

// TODO (fase E): substituir por dados reais
const SUBJECT_GRADES: React.ComponentProps<typeof SubjectGradeCard>[] = [
  { subject: "Matemática", icon: "calculate", average: 4.5, absences: 2 },
  { subject: "Português", icon: "menu_book", average: 9.2, absences: 0 },
  { subject: "História", icon: "history_edu", average: 6.8, absences: 4 },
];

export default async function PerformancePage() {
  const user = await requireRole(["student", "guardian"]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Desempenho por matéria"
        subtitle={
          user.role === "guardian"
            ? `Acompanhe as notas e faltas de ${STUDENT.firstName} no semestre atual.`
            : "Acompanhe suas notas e faltas no semestre atual."
        }
      />
      <ul className="space-y-3">
        {SUBJECT_GRADES.map((subjectGrade) => (
          <li key={subjectGrade.subject}>
            <SubjectGradeCard {...subjectGrade} />
          </li>
        ))}
      </ul>
    </div>
  );
}
