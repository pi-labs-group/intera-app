import { PageHeading } from "@/components/ui/page-heading";
import { SubjectGradeCard } from "@/components/ui/subject-grade-card";

// TODO (fase E): substituir por dados reais
const SUBJECT_GRADES: React.ComponentProps<typeof SubjectGradeCard>[] = [
  { subject: "Matemática", icon: "calculate", average: 4.5, absences: 2 },
  { subject: "Português", icon: "menu_book", average: 9.2, absences: 0 },
  { subject: "História", icon: "history_edu", average: 6.8, absences: 4 },
];

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Desempenho por matéria"
        subtitle="Acompanhe suas notas e faltas no semestre atual."
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
