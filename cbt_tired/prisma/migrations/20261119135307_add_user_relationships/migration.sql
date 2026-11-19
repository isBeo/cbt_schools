/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'STUDENT';
ALTER TYPE "Role" ADD VALUE 'PARENT';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "ParentStudent" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "relationship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAssignment" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentStudent_parentId_studentId_key" ON "ParentStudent"("parentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_teacherId_classId_subjectId_key" ON "TeacherAssignment"("teacherId", "classId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- AddForeignKey
ALTER TABLE "ParentStudent" ADD CONSTRAINT "ParentStudent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent" ADD CONSTRAINT "ParentStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
