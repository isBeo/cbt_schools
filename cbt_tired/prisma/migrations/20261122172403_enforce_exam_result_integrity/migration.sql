/*
  Warnings:

  - A unique constraint covering the columns `[resultId,questionId]` on the table `ResultDetail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[attemptId,questionId]` on the table `StudentAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ResultDetail_resultId_questionId_key" ON "ResultDetail"("resultId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswer_attemptId_questionId_key" ON "StudentAnswer"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "ResultDetail" ADD CONSTRAINT "ResultDetail_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
