import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeadlineItem } from "@/components/ui/deadline-item";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";

// TODO (fase E): substituir por dados reais
const STUDENT = { name: "Lucas Andrade", className: "9º A" };

// TODO (fase E): substituir por dados reais
const METRICS = {
  attendance: "94%",
  averageGrade: "6,8",
  pendingActivities: "3",
};

// TODO (fase E): substituir por dados reais
const DEADLINES: Omit<React.ComponentProps<typeof DeadlineItem>, "href">[] = [
  {
    title: "Trabalho de História",
    subject: "História",
    date: "15/10",
    relativeLabel: "Amanhã",
    urgency: "danger",
  },
  {
    title: "Lista de Exercícios",
    subject: "Matemática",
    date: "18/10",
    relativeLabel: "Em 4 dias",
    urgency: "warning",
  },
  {
    title: "Feira de Ciências",
    subject: "Ciências",
    date: "22/10",
    relativeLabel: "Em 8 dias",
    urgency: "primary",
  },
];

// TODO (fase E): substituir por dados reais
const LATEST_ANNOUNCEMENT = {
  date: "Hoje, 08:30",
  priority: "Alta",
  title: "Reunião de Pais e Mestres",
  summary:
    "Lembramos que nesta quinta-feira teremos nossa reunião bimestral para acompanhamento do desempenho dos alunos.",
};

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Olá, Responsável 👋
        </h1>
        <p className="text-sm font-medium text-neutral-600">
          {STUDENT.name} · {STUDENT.className}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          icon="calendar_month"
          value={METRICS.attendance}
          label="Frequência"
          tone="success"
        />
        <MetricCard
          icon="bar_chart"
          value={METRICS.averageGrade}
          label="Média geral"
          tone="primary"
          href="/performance"
          ariaLabel={`Média geral ${METRICS.averageGrade}. Ver desempenho`}
        />
        <MetricCard
          icon="pending_actions"
          value={METRICS.pendingActivities}
          label="Pendentes"
          tone="danger"
          href="/activities"
          ariaLabel={`${METRICS.pendingActivities} atividades pendentes. Ver atividades`}
        />
      </div>

      <section className="space-y-3">
        <SectionHeader
          title="Próximos prazos"
          action={{
            label: "VER TODAS",
            href: "/activities",
            ariaLabel: "Ver todas as atividades",
          }}
        />
        <ul className="space-y-2.5">
          {DEADLINES.map((deadline) => (
            <li key={deadline.title}>
              <DeadlineItem {...deadline} href="/activities" />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Avisos recentes"
          action={{
            label: "VER TODOS",
            href: "/announcements",
            ariaLabel: "Ver todos os avisos",
          }}
        />
        <Card href="/announcements" className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">
              {LATEST_ANNOUNCEMENT.date}
            </span>
            <Badge variant="danger">
              <span className="sr-only">Prioridade </span>
              {LATEST_ANNOUNCEMENT.priority}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-neutral-800">
            {LATEST_ANNOUNCEMENT.title}
          </h3>
          <p className="line-clamp-2 text-xs text-neutral-600">
            {LATEST_ANNOUNCEMENT.summary}
          </p>
        </Card>
      </section>
    </div>
  );
}
