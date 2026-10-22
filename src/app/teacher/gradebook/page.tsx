import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/page-heading";
import {
  getTeacherDiaries,
  getTeacherGrades,
} from "@/server/services/teacher-service";
import {
  GradebookEditor,
  type GradebookTab,
} from "./_components/gradebook-editor";

export const metadata: Metadata = {
  title: "Lançamentos · Intera",
};

const TABS: GradebookTab[] = ["grades", "assignments", "attendance"];

/** Data de hoje no fuso da escola, no formato do `<input type="date">`. */
function todayInSchoolTimeZone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export default async function GradebookPage({
  searchParams,
}: PageProps<"/teacher/gradebook">) {
  const { tab } = await searchParams;
  const defaultTab = TABS.find((item) => item === tab);
  const [[firstDiary, ...otherDiaries], initialGrades] = await Promise.all([
    getTeacherDiaries(),
    getTeacherGrades(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Lançamentos"
        subtitle="Notas, trabalhos e faltas das suas turmas."
      />
      {firstDiary ? (
        <GradebookEditor
          diaries={[firstDiary, ...otherDiaries]}
          today={todayInSchoolTimeZone()}
          defaultTab={defaultTab}
          initialGrades={initialGrades}
        />
      ) : (
        <p className="text-center text-sm text-neutral-500">
          Nenhum diário atribuído a você neste ano letivo.
        </p>
      )}
    </div>
  );
}
