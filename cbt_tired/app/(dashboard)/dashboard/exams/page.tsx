
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

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Exams</h1>
        <p className="text-muted-foreground">
          Create exams, import questions and manage exam status.
        </p>
      </div>

      <CreateExam classes={classes} subjects={subjects} />

      <ExamTable />
    </div>
  )
}
