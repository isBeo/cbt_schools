
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"

import { StudentHeader } from "./components/student-header"
import { ExamList } from "./components/exam-list"
import { EmptyState } from "./components/empty-list"

type Props = {
  params: Promise<{
    studentId: string
  }>
}

export default async function StudentPage({ params }: Props) {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const { studentId } = await params
  const id = Number(studentId)

  if (
    !Number.isInteger(userId) ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    notFound()
  }

  const student = await prisma.student.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      classId: true,
      class: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!student) {
    notFound()
  }

  const now = new Date()

  const exams = await prisma.exam.findMany({
    where: {
      classId: student.classId,
      status: "ACTIVE",
      AND: [
        {
          OR: [
            { startTime: null },
            { startTime: { lte: now } },
          ],
        },
        {
          OR: [
            { endTime: null },
            { endTime: { gte: now } },
          ],
        },
      ],
      attempts: {
        none: {
          studentId: student.id,
        },
      },
    },
    include: {
      subject: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      subject: {
        name: "asc",
      },
    },
  })

  return (
    <div className="container mx-auto max-w-5xl space-y-6 py-8">
      <StudentHeader
        firstName={student.firstName}
        lastName={student.lastName}
        className={student.class.name}
      />

      {exams.length === 0 ? (
        <EmptyState />
      ) : (
        <ExamList exams={exams} />
      )}
    </div>
  )
}
