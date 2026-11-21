/*
  Warnings:

  - A unique constraint covering the columns `[studentId,examId]` on the table `ExamAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExamAttempt_studentId_examId_key" ON "ExamAttempt"("studentId", "examId");
