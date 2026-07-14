import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

import { StudentHeader } from "./components/student-header"
import { ExamList } from "./components/exam-list"
import { EmptyState } from "./components/empty-list"

type Props = {
  params: Promise<{
    studentId: string
  }>
}

export default async function StudentPage({ params }: Props) {
  const { studentId } = await params

  const student = await prisma.student.findUnique({
    where: {
      id: Number(studentId),
    },
    include: {
      class: true,
    },
  })

  if (!student) {
    notFound()
  }

  const exams = await prisma.exam.findMany({
    where: {
      classId: student.classId,
      status: "PUBLISHED",
    },
    include: {
      subject: true,
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
        <ExamList exams={exams} studentId={student.id} />
      )}
    </div>
  )
}
