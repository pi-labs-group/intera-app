import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/page-heading";
import { todayInSaoPaulo } from "@/lib/school-calendar";
import { getCurrentBimester } from "@/server/services/school-calendar-service";
import {
  getTeacherAbsences,
  getTeacherAssignmentGrades,
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

export default async function GradebookPage({
  searchParams,
}: PageProps<"/teacher/gradebook">) {
  const { tab } = await searchParams;
  const defaultTab = TABS.find((item) => item === tab);
  const [
    [firstDiary, ...otherDiaries],
    initialGrades,
    initialAssignmentGrades,
    initialAbsences,
    currentBimester,
  ] = await Promise.all([
    getTeacherDiaries(),
    getTeacherGrades(),
    getTeacherAssignmentGrades(),
    getTeacherAbsences(),
    getCurrentBimester(),
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
          today={todayInSaoPaulo(new Date())}
          currentBimester={currentBimester}
          defaultTab={defaultTab}
          initialGrades={initialGrades}
          initialAssignmentGrades={initialAssignmentGrades}
          initialAbsences={initialAbsences}
        />
      ) : (
        <p className="text-center text-sm text-neutral-500">
          Nenhum diário atribuído a você neste ano letivo.
        </p>
      )}
    </div>
  );
}
