import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/page-heading";
import {
  getCurrentTeacher,
  getTeacherDiaries,
} from "@/server/services/teacher-service";
import {
  NoticeComposer,
  type PublishedNotice,
} from "./_components/notice-composer";

export const metadata: Metadata = {
  title: "Avisos da matéria · Intera",
};

// TODO (fase E): substituir por dados reais
const PUBLISHED_NOTICES: PublishedNotice[] = [
  {
    id: "aviso-1",
    diaryId: "mat-9a",
    priority: "urgente",
    title: "Prova 2 remarcada",
    body: "A Prova 2 de Matemática passou para a próxima terça-feira. Conteúdo: equações do 1º grau.",
    date: "Ontem, 16:40",
  },
  {
    id: "aviso-2",
    diaryId: "mat-8a",
    priority: "aviso",
    title: "Levar calculadora",
    body: "Na aula de quinta-feira faremos exercícios de porcentagem; tragam calculadora.",
    date: "Seg, 10:15",
  },
];

export default async function TeacherNoticesPage() {
  const [teacher, diaries] = await Promise.all([
    getCurrentTeacher(),
    getTeacherDiaries(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Avisos da matéria"
        subtitle="Publique comunicados para alunos e responsáveis das suas turmas."
      />
      <NoticeComposer
        diaries={diaries.map(({ id, subject, className }) => ({
          id,
          subject,
          className,
        }))}
        author={`${teacher.displayName} (${teacher.subject})`}
        initialNotices={PUBLISHED_NOTICES}
      />
    </div>
  );
}
