import { startExam } from "@/app/actions/exam"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { ExamForm } from "@/components/forms/ExamForm"

type Props = {
  params: Promise<{
    examId: string
  }>
}

export default async function ExamPage({ params }: Props) {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const { examId } = await params
  const id = Number(examId)

  if (!Number.isInteger(userId) || !Number.isInteger(id) || id <= 0) {
    notFound()
  }

  const student = await prisma.student.findUnique({
    where: {
      userId,
    },
  })

  if (!student) {
    notFound()
  }

  const exam = await prisma.exam.findFirst({
    where: {
      id,
      classId: student.classId,
      status: "ACTIVE",
      AND: [
        {
          OR: [{ startTime: null }, { startTime: { lte: new Date() } }],
        },
        {
          OR: [{ endTime: null }, { endTime: { gte: new Date() } }],
        },
      ],
    },
    include: {
      questions: {
        include: {
          options: {
            select: {
              id: true,
              optionText: true,
              optionOrder: true,
            },
          },
        },
        orderBy: {
          questionOrder: "asc",
        },
      },
    },
  })

if (!exam) {
  notFound()
}

const attempt = await startExam(exam.id)

return (
  <main className="mx-auto max-w-4xl p-6">
    <ExamForm
      exam={exam}
      duration={exam.durationMinutes}
      attemptId={attempt.attemptId}
      expiresAt={attempt.expiresAt}
    />
  </main>
)
}
