import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getCurrentTeacher,
  getTeacherDiaries,
} from "@/server/services/teacher-service";

const QUICK_ACTIONS = [
  {
    href: "/teacher/gradebook?tab=grades",
    icon: "grading",
    label: "Lançar notas",
    hint: "Provas, simulado e participação",
  },
  {
    href: "/teacher/gradebook?tab=assignments",
    icon: "assignment_add",
    label: "Trabalhos",
    hint: "Cadastrar e dar nota",
  },
  {
    href: "/teacher/gradebook?tab=attendance",
    icon: "event_busy",
    label: "Registrar faltas",
    hint: "Chamada do dia",
  },
  {
    href: "/teacher/notices",
    icon: "campaign",
    label: "Publicar aviso",
    hint: "Para a turma da matéria",
  },
];

export default async function TeacherHomePage() {
  const [teacher, diaries] = await Promise.all([
    getCurrentTeacher(),
    getTeacherDiaries(),
  ]);
  const studentCount = diaries.reduce(
    (total, diary) => total + diary.students.length,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Olá, {teacher.displayName} 👋
        </h1>
        <p className="text-sm font-medium text-neutral-600">
          Professor de {teacher.subject} · 4º bimestre
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon="groups"
          value={String(diaries.length)}
          label="Turmas"
          tone="primary"
        />
        <MetricCard
          icon="person"
          value={String(studentCount)}
          label="Alunos"
          tone="success"
        />
      </div>

      <section className="space-y-3">
        <SectionHeader title="Atalhos" />
        <ul className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <li key={action.label}>
              <Card
                href={action.href}
                tone="brand"
                className="flex h-full flex-col gap-1"
              >
                <span
                  className="material-symbols-outlined text-primary"
                  aria-hidden="true"
                >
                  {action.icon}
                </span>
                <span className="text-sm font-bold text-neutral-800">
                  {action.label}
                </span>
                <span className="text-xs text-neutral-500">{action.hint}</span>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Meus diários" />
        <ul className="space-y-2.5">
          {diaries.map((diary) => (
            <li key={diary.id}>
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    {diary.subjectIcon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-neutral-800">
                    {diary.subject} · {diary.className}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {diary.students.length} alunos ·{" "}
                    {diary.assessments.map((item) => item.code).join(", ")}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
