-- Liga o Row Level Security em todas as tabelas, sem políticas. No Supabase, o
-- schema public é exposto pela Data API com a chave anon (pública); sem RLS,
-- qualquer um com essa chave leria os dados dos alunos. O Prisma conecta como
-- dono das tabelas e não é afetado. Tabelas novas precisam da mesma linha.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "guardians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_guardians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "school_years" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "school_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "diaries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "diary_assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bimester_averages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "final_averages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "syllabus_contents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notices" ENABLE ROW LEVEL SECURITY;
