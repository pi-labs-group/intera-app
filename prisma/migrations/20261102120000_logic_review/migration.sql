-- Correções da revisão de lógica de 02/11/2026.
-- Parte gerada pelo Prisma (prisma migrate diff) + blocos manuais no fim:
-- CHECKs, índice parcial do ano atual, triggers de matrícula e RLS.

-- CreateEnum
CREATE TYPE "enrollment_status" AS ENUM ('active', 'transferred', 'moved', 'dropped');

-- DropIndex
DROP INDEX "attendances_enrollment_id_diary_id_date_key";

-- AlterTable
ALTER TABLE "school_years" ADD COLUMN     "is_current" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "school_classes" ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "left_at" DATE,
ADD COLUMN     "status" "enrollment_status" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "lesson_number" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
-- Os trabalhos existentes são só dados de desenvolvimento: entram no 4º bimestre.
ALTER TABLE "assignments" ADD COLUMN     "bimester" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "max_grade" DECIMAL(4,2) NOT NULL DEFAULT 10;
ALTER TABLE "assignments" ALTER COLUMN "bimester" DROP DEFAULT;

-- CreateTable
CREATE TABLE "school_periods" (
    "id" SERIAL NOT NULL,
    "school_year_id" INTEGER NOT NULL,
    "bimester" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "school_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_grades" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "value" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "assignment_grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_periods_school_year_id_bimester_key" ON "school_periods"("school_year_id", "bimester");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_grades_assignment_id_enrollment_id_key" ON "assignment_grades"("assignment_id", "enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_enrollment_id_diary_id_date_lesson_number_key" ON "attendances"("enrollment_id", "diary_id", "date", "lesson_number");

-- AddForeignKey
ALTER TABLE "school_periods" ADD CONSTRAINT "school_periods_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
-- Falha se já existir nota de avaliação não declarada pelo diário; nesse caso,
-- declare a avaliação em diary_assessments ou apague a nota antes de migrar.
ALTER TABLE "grades" ADD CONSTRAINT "grades_diary_id_assessment_type_id_fkey" FOREIGN KEY ("diary_id", "assessment_type_id") REFERENCES "diary_assessments"("diary_id", "assessment_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_grades" ADD CONSTRAINT "assignment_grades_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_grades" ADD CONSTRAINT "assignment_grades_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===================== Blocos manuais =====================

-- Bimestre entre 1 e 4
ALTER TABLE grades            ADD CONSTRAINT grades_bimester_chk            CHECK (bimester BETWEEN 1 AND 4);
ALTER TABLE bimester_averages ADD CONSTRAINT bimester_averages_bimester_chk CHECK (bimester BETWEEN 1 AND 4);
ALTER TABLE syllabus_contents ADD CONSTRAINT syllabus_contents_bimester_chk CHECK (bimester BETWEEN 1 AND 4);
ALTER TABLE assignments       ADD CONSTRAINT assignments_bimester_chk       CHECK (bimester BETWEEN 1 AND 4);
ALTER TABLE school_periods    ADD CONSTRAINT school_periods_bimester_chk    CHECK (bimester BETWEEN 1 AND 4);
ALTER TABLE school_periods    ADD CONSTRAINT school_periods_dates_chk       CHECK (start_date <= end_date);

-- Valores não negativos e nota máxima positiva. "Nota <= nota máxima" fica no
-- serviço: cruza tabelas e max_grade nulo significa 10.
ALTER TABLE grades            ADD CONSTRAINT grades_value_chk            CHECK (value >= 0);
ALTER TABLE assignment_grades ADD CONSTRAINT assignment_grades_value_chk CHECK (value >= 0);
ALTER TABLE diary_assessments ADD CONSTRAINT diary_assessments_max_chk   CHECK (max_grade IS NULL OR max_grade > 0);
ALTER TABLE assignments       ADD CONSTRAINT assignments_max_chk         CHECK (max_grade > 0);

-- Frequência coerente: falta compensada pressupõe falta.
ALTER TABLE attendances ADD CONSTRAINT attendances_lesson_chk      CHECK (lesson_number >= 1);
ALTER TABLE attendances ADD CONSTRAINT attendances_compensated_chk CHECK (NOT (present AND compensated));

-- Só um ano letivo atual
CREATE UNIQUE INDEX school_years_single_current ON school_years (is_current) WHERE is_current;

-- A matrícula precisa ser da turma do diário. search_path fixo para a função
-- não depender do search_path de quem executa (recomendação do linter do Supabase).
CREATE FUNCTION check_enrollment_matches_diary() RETURNS trigger
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM enrollments e
    JOIN diaries d ON d.school_class_id = e.school_class_id
    WHERE e.id = NEW.enrollment_id AND d.id = NEW.diary_id
  ) THEN
    RAISE EXCEPTION 'Matrícula % não pertence à turma do diário %', NEW.enrollment_id, NEW.diary_id;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER grades_enrollment_diary            BEFORE INSERT OR UPDATE ON grades            FOR EACH ROW EXECUTE FUNCTION check_enrollment_matches_diary();
CREATE TRIGGER attendances_enrollment_diary       BEFORE INSERT OR UPDATE ON attendances       FOR EACH ROW EXECUTE FUNCTION check_enrollment_matches_diary();
CREATE TRIGGER bimester_averages_enrollment_diary BEFORE INSERT OR UPDATE ON bimester_averages FOR EACH ROW EXECUTE FUNCTION check_enrollment_matches_diary();
CREATE TRIGGER final_averages_enrollment_diary    BEFORE INSERT OR UPDATE ON final_averages    FOR EACH ROW EXECUTE FUNCTION check_enrollment_matches_diary();

-- Mesma regra para assignment_grades, pelo diário do trabalho
CREATE FUNCTION check_assignment_grade_enrollment() RETURNS trigger
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM enrollments e
    JOIN diaries d ON d.school_class_id = e.school_class_id
    JOIN assignments a ON a.diary_id = d.id
    WHERE e.id = NEW.enrollment_id AND a.id = NEW.assignment_id
  ) THEN
    RAISE EXCEPTION 'Matrícula % não pertence à turma do trabalho %', NEW.enrollment_id, NEW.assignment_id;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER assignment_grades_enrollment BEFORE INSERT OR UPDATE ON assignment_grades FOR EACH ROW EXECUTE FUNCTION check_assignment_grade_enrollment();

-- Tabelas novas seguem a regra da migração enable_rls (RLS ligado, sem políticas).
ALTER TABLE "school_periods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assignment_grades" ENABLE ROW LEVEL SECURITY;
