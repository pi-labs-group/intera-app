import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/page-heading";
import { gradeKey } from "@/lib/gradebook";
import { getTeacherDiaries } from "@/server/services/teacher-service";
import {
  GradebookEditor,
  type GradebookTab,
} from "./_components/gradebook-editor";

export const metadata: Metadata = {
  title: "Lançamentos · Intera",
};

const TABS: GradebookTab[] = ["grades", "assignments", "attendance"];

// TODO (fase E): substituir por dados reais (NotaRepository.listarPorDiarioEBimestre)
const LAUNCHED_P1_GRADES: Record<string, string> = {
  "m-9a-01": "7,5",
  "m-9a-02": "6,0",
  "m-9a-03": "9,0",
  "m-9a-05": "8,5",
  "m-9a-06": "7,0",
  "m-9a-07": "4,5",
};

const INITIAL_GRADES = Object.fromEntries(
  Object.entries(LAUNCHED_P1_GRADES).map(([enrollmentId, value]) => [
    gradeKey("mat-9a", 4, "p1", enrollmentId),
    value,
  ]),
);

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
  const [firstDiary, ...otherDiaries] = await getTeacherDiaries();

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
          initialGrades={INITIAL_GRADES}
        />
      ) : (
        <p className="text-center text-sm text-neutral-500">
          Nenhum diário atribuído a você neste ano letivo.
        </p>
      )}
    </div>
  );
}
