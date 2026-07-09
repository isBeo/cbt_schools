-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "questionSource" TEXT;

-- AlterTable
ALTER TABLE "ExamAttempt" ADD COLUMN     "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS';
