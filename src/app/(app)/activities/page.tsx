import { PageHeading } from "@/components/ui/page-heading";
import { Tabs } from "@/components/ui/tabs";
import { TaskItem } from "@/components/ui/task-item";

type Task = React.ComponentProps<typeof TaskItem>;

// TODO (fase E): substituir por dados reais
const TASKS: Task[] = [
  {
    subject: "Matemática",
    title: "Lista de Exercícios: Frações",
    status: "pendente",
    dueLabel: "Hoje, 23:59",
  },
  {
    subject: "Ciências",
    title: "Projeto: Ciclo da Água (Visual)",
    status: "pendente",
    dueLabel: "Amanhã",
    isAdapted: true,
  },
  {
    subject: "Português",
    title: "Redação: Meio Ambiente",
    status: "entregue",
    dueLabel: "08/10",
  },
  {
    subject: "Geografia",
    title: "Mapa das Regiões",
    status: "entregue",
    dueLabel: "06/10",
  },
  {
    subject: "Inglês",
    title: "Worksheet: Simple Past",
    status: "entregue",
    dueLabel: "03/10",
  },
  {
    subject: "História",
    title: "Resumo do capítulo 5",
    status: "atrasada",
    dueLabel: "Ontem",
  },
  {
    subject: "Artes",
    title: "Releitura de obra modernista",
    status: "atrasada",
    dueLabel: "02/10",
  },
];

// Atrasadas ficam só em "Não entregues"; em "Atividades", pendentes antes das entregues.
const ACTIVE_TASKS = [
  ...TASKS.filter((task) => task.status === "pendente"),
  ...TASKS.filter((task) => task.status === "entregue"),
];
const OVERDUE_TASKS = TASKS.filter((task) => task.status === "atrasada");

function TaskList({
  tasks,
  emptyMessage,
}: {
  tasks: Task[];
  emptyMessage: string;
}) {
  if (tasks.length === 0) {
    return (
      <p className="text-center text-sm text-neutral-500">{emptyMessage}</p>
    );
  }
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.title}>
          <TaskItem {...task} />
        </li>
      ))}
    </ul>
  );
}

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Minhas Atividades"
        subtitle="Acompanhe seus trabalhos e tarefas."
      />
      <Tabs
        ariaLabel="Situação das atividades"
        tabs={[
          {
            id: "activities",
            label: "Atividades",
            content: (
              <TaskList
                tasks={ACTIVE_TASKS}
                emptyMessage="Nenhuma atividade no momento."
              />
            ),
          },
          {
            id: "overdue",
            label: "Não entregues",
            content: (
              <TaskList
                tasks={OVERDUE_TASKS}
                emptyMessage="Nenhuma atividade atrasada."
              />
            ),
          },
        ]}
      />
    </div>
  );
}
