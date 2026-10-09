import { NoticeCard } from "@/components/ui/notice-card";
import { PageHeading } from "@/components/ui/page-heading";
import { requireRole } from "@/server/services/auth-service";

// TODO (fase E): substituir por dados reais
const NOTICES: React.ComponentProps<typeof NoticeCard>[] = [
  {
    priority: "urgente",
    title: "Mudança no calendário de provas finais",
    body: "Atenção alunos e responsáveis: as datas das avaliações finais do 3º trimestre foram alteradas devido aos jogos interescolares.",
    author: "Coordenação Pedagógica",
    date: "Hoje, 08:30",
  },
  {
    priority: "aviso",
    title: "Feira de Ciências: Inscrições Abertas!",
    body: "As inscrições para a Feira de Ciências deste ano já estão liberadas. Monte sua equipe e inscreva seu projeto.",
    author: "Prof. Carlos (Ciências)",
    date: "Ontem, 14:15",
  },
  {
    priority: "aviso",
    title: "Reunião de Pais e Mestres",
    body: "Reunião bimestral para acompanhamento do desempenho dos alunos nesta quinta-feira.",
    author: "Direção",
    date: "Seg, 09:00",
  },
];

export default async function AnnouncementsPage() {
  await requireRole(["student", "guardian"]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Comunicados"
        subtitle="Fique por dentro das últimas atualizações da escola."
      />
      <ul className="space-y-3">
        {NOTICES.map((notice) => (
          <li key={notice.title}>
            <NoticeCard {...notice} />
          </li>
        ))}
      </ul>
    </div>
  );
}
