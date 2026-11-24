import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CreateQuestion from "./components/create_question"
import BulkQuestionImport from "./components/bulk_question_import"

export default async function QuestionsPage() {
  const session = await auth()

  if (!session?.user) redirect("/login")

  if (!["TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  if (!session.user.schoolId) redirect("/dashboard")

  const userId = Number(session.user.id)
  const schoolId = session.user.schoolId
  const isTeacher = session.user.role === "TEACHER"

  const assignments = isTeacher
    ? await prisma.teacherAssignment.findMany({
        where: { teacherId: userId },
        select: {
          classId: true,
          subjectId: true,
        },
      })
    : []

  const assignmentPairs = assignments.map(
    (item) => `${item.classId}-${item.subjectId}`
  )

  const assignedClassIds = [...new Set(assignments.map((item) => item.classId))]

  const assignedSubjectIds = [
    ...new Set(assignments.map((item) => item.subjectId)),
  ]

  const [classes, subjects, questions] = await Promise.all([
    prisma.class.findMany({
      where: isTeacher
        ? { id: { in: assignedClassIds }, schoolId }
        : { schoolId },
      orderBy: { name: "asc" },
    }),

    prisma.subject.findMany({
      where: isTeacher
        ? { id: { in: assignedSubjectIds }, schoolId }
        : { schoolId },
      orderBy: { name: "asc" },
    }),

    prisma.bankQuestion.findMany({
      where: {
        schoolId,
        isActive: true,
        ...(isTeacher
          ? {
              OR: assignments.map((assignment) => ({
                classId: assignment.classId,
                subjectId: assignment.subjectId,
              })),
            }
          : {}),
      },
      include: {
        options: {
          orderBy: { optionOrder: "asc" },
        },
        class: {
          select: { name: true },
        },
        subject: {
          select: { name: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const safeQuestions = questions.map((question) => ({
    id: question.id,
    questionText: question.questionText,
    marks: question.marks,
    classId: question.classId,
    subjectId: question.subjectId,
    className: question.class.name,
    subjectName: question.subject.name,
    createdByName: question.createdBy.name,
    createdAt: question.createdAt.toISOString(),
    options: question.options.map((option) => ({
      id: option.id,
      optionText: option.optionText,
      isCorrect: option.isCorrect,
      optionOrder: option.optionOrder,
    })),
  }))

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage reusable examination questions.
        </p>
      </div>

      <CreateQuestion
        classes={classes}
        subjects={subjects}
        questions={safeQuestions}
        isTeacher={isTeacher}
        assignments={assignmentPairs}
      />

      <BulkQuestionImport
        classes={classes}
        subjects={subjects}
        isTeacher={isTeacher}
        assignments={assignmentPairs}
      />
    </div>
  )
}
