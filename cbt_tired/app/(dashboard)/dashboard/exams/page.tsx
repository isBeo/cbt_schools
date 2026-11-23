import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CreateExam from "./components/create_exam"
import ExamTable from "./components/exam_table"

export default async function ExamsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id, role, schoolId } = session.user

  let classes: { id: number; name: string }[] = []
  let subjects: { id: number; name: string }[] = []

  let bankQuestions: {
  id: number
  questionText: string
  marks: number
  classId: number
  subjectId: number
  options: {
    id: number
    optionText: string
    optionOrder: number
    isCorrect: boolean
  }[]
}[] = []

  if (role === "SUPER_ADMIN") {
    const [allClasses, allSubjects] = await Promise.all([
      prisma.class.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.subject.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ])

    classes = allClasses
    subjects = allSubjects
  } else if (role === "SCHOOL_ADMIN") {
    if (!schoolId) {
      redirect("/login")
    }

    const [schoolClasses, schoolSubjects] = await Promise.all([
      prisma.class.findMany({
        where: { schoolId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.subject.findMany({
        where: { schoolId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ])

    classes = schoolClasses
    subjects = schoolSubjects
  } else if (role === "TEACHER") {
    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        teacherId: Number(id),
      },
      include: {
        class: {
          select: { id: true, name: true },
        },
        subject: {
          select: { id: true, name: true },
        },
      },
    })

    classes = [
      ...new Map(
        assignments.map((item) => [item.class.id, item.class])
      ).values(),
    ]

    subjects = [
      ...new Map(
        assignments.map((item) => [item.subject.id, item.subject])
      ).values(),
    ]
  } else {
    redirect("/dashboard")
  }

  if (role === "SUPER_ADMIN" || role === "SCHOOL_ADMIN" || role === "TEACHER") {
  bankQuestions = await prisma.bankQuestion.findMany({
    where: {
      isActive: true,
      ...(schoolId ? { schoolId } : {}),
      ...(role === "TEACHER"
        ? {
            OR: classes.flatMap((classItem) =>
              subjects.map((subjectItem) => ({
                classId: classItem.id,
                subjectId: subjectItem.id,
              }))
            ),
          }
        : {}),
    },
    select: {
      id: true,
      questionText: true,
      marks: true,
      classId: true,
      subjectId: true,
      options: {
        select: {
          id: true,
          optionText: true,
          optionOrder: true,
          isCorrect: true,
        },
        orderBy: { optionOrder: "asc" },
      },
    },
    orderBy: { id: "desc" },
  })
}

console.log(
  "EXAM BANK QUESTIONS:",
  bankQuestions.map((q) => ({
    id: q.id,
    classId: q.classId,
    subjectId: q.subjectId,
  }))
)
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Exams</h1>
        <p className="text-muted-foreground">
          Create exams, import questions and manage exam status.
        </p>
      </div>

      <CreateExam
  classes={classes}
  subjects={subjects}
  bankQuestions={bankQuestions}
/>

      <ExamTable />
    </div>
  )
}
