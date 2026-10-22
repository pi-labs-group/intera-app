-- CreateEnum
CREATE TYPE "role" AS ENUM ('guardian', 'student', 'teacher', 'secretary');

-- CreateEnum
CREATE TYPE "notice_priority" AS ENUM ('normal', 'urgent');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "role" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "registration_number" TEXT,
    "name" TEXT NOT NULL,
    "photo_url" TEXT,
    "user_id" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_guardians" (
    "student_id" TEXT NOT NULL,
    "guardian_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,

    CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("student_id","guardian_id")
);

-- CreateTable
CREATE TABLE "school_years" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "school_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_classes" (
    "id" TEXT NOT NULL,
    "school_year_id" INTEGER NOT NULL,
    "grade_level" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "education_level" TEXT NOT NULL,

    CONSTRAINT "school_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "school_class_id" TEXT NOT NULL,
    "call_number" INTEGER NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "icon" TEXT,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diaries" (
    "id" TEXT NOT NULL,
    "school_class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT,

    CONSTRAINT "diaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "assessment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diary_assessments" (
    "id" TEXT NOT NULL,
    "diary_id" TEXT NOT NULL,
    "assessment_type_id" TEXT NOT NULL,
    "order" INTEGER,
    "max_grade" DECIMAL(4,2),

    CONSTRAINT "diary_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "diary_id" TEXT NOT NULL,
    "bimester" INTEGER NOT NULL,
    "assessment_type_id" TEXT NOT NULL,
    "value" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "diary_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "present" BOOLEAN NOT NULL,
    "compensated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bimester_averages" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "diary_id" TEXT NOT NULL,
    "bimester" INTEGER NOT NULL,
    "average" DECIMAL(4,2),
    "absences" INTEGER NOT NULL DEFAULT 0,
    "compensated_absences" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bimester_averages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_averages" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "diary_id" TEXT NOT NULL,
    "final_average" DECIMAL(4,2),
    "rounded_grade" INTEGER,

    CONSTRAINT "final_averages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syllabus_contents" (
    "id" TEXT NOT NULL,
    "diary_id" TEXT NOT NULL,
    "bimester" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "syllabus_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "diary_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "due_date" DATE NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "diary_id" TEXT,
    "author_id" TEXT NOT NULL,
    "priority" "notice_priority" NOT NULL DEFAULT 'normal',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_registration_number_key" ON "students"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "guardians_user_id_key" ON "guardians"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_years_year_key" ON "school_years"("year");

-- CreateIndex
CREATE UNIQUE INDEX "school_classes_school_year_id_grade_level_name_shift_key" ON "school_classes"("school_year_id", "grade_level", "name", "shift");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_school_class_id_call_number_key" ON "enrollments"("school_class_id", "call_number");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_school_class_id_key" ON "enrollments"("student_id", "school_class_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE INDEX "diaries_teacher_id_idx" ON "diaries"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "diaries_school_class_id_subject_id_key" ON "diaries"("school_class_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_types_code_key" ON "assessment_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "diary_assessments_diary_id_assessment_type_id_key" ON "diary_assessments"("diary_id", "assessment_type_id");

-- CreateIndex
CREATE INDEX "grades_diary_id_bimester_idx" ON "grades"("diary_id", "bimester");

-- CreateIndex
CREATE UNIQUE INDEX "grades_enrollment_id_diary_id_bimester_assessment_type_id_key" ON "grades"("enrollment_id", "diary_id", "bimester", "assessment_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_enrollment_id_diary_id_date_key" ON "attendances"("enrollment_id", "diary_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "bimester_averages_enrollment_id_diary_id_bimester_key" ON "bimester_averages"("enrollment_id", "diary_id", "bimester");

-- CreateIndex
CREATE UNIQUE INDEX "final_averages_enrollment_id_diary_id_key" ON "final_averages"("enrollment_id", "diary_id");

-- CreateIndex
CREATE UNIQUE INDEX "syllabus_contents_diary_id_bimester_key" ON "syllabus_contents"("diary_id", "bimester");

-- CreateIndex
CREATE INDEX "notices_diary_id_idx" ON "notices"("diary_id");

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_classes" ADD CONSTRAINT "school_classes_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_school_class_id_fkey" FOREIGN KEY ("school_class_id") REFERENCES "school_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaries" ADD CONSTRAINT "diaries_school_class_id_fkey" FOREIGN KEY ("school_class_id") REFERENCES "school_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaries" ADD CONSTRAINT "diaries_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaries" ADD CONSTRAINT "diaries_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_assessments" ADD CONSTRAINT "diary_assessments_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_assessments" ADD CONSTRAINT "diary_assessments_assessment_type_id_fkey" FOREIGN KEY ("assessment_type_id") REFERENCES "assessment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_assessment_type_id_fkey" FOREIGN KEY ("assessment_type_id") REFERENCES "assessment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bimester_averages" ADD CONSTRAINT "bimester_averages_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bimester_averages" ADD CONSTRAINT "bimester_averages_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_averages" ADD CONSTRAINT "final_averages_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_averages" ADD CONSTRAINT "final_averages_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_contents" ADD CONSTRAINT "syllabus_contents_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
