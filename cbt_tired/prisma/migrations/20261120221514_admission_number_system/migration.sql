/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,admissionNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `school` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Student_admissionNo_key";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "admissionYear" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "school" ADD COLUMN     "code" TEXT;

-- CreateTable
CREATE TABLE "AdmissionSequence" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "admissionYear" INTEGER NOT NULL,
    "lastSerial" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdmissionSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionSequence_schoolId_admissionYear_key" ON "AdmissionSequence"("schoolId", "admissionYear");

-- CreateIndex
CREATE UNIQUE INDEX "Student_schoolId_admissionNo_key" ON "Student"("schoolId", "admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "school_code_key" ON "school"("code");

-- AddForeignKey
ALTER TABLE "AdmissionSequence" ADD CONSTRAINT "AdmissionSequence_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
