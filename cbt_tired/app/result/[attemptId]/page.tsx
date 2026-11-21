
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"

type Props = {
  params: Promise<{
    attemptId: string
  }>
}

export default async function ResultPage({ params }: Props) {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const { attemptId } = await params
  const id = Number(attemptId)

  if (
    !Number.isInteger(userId) ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
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

  const attempt = await prisma.examAttempt.findFirst({
    where: {
      id,
      studentId: student.id,
    },
    include: {
      exam: true,
      result: true,
    },
  })

  if (!attempt || !attempt.result) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl border bg-background p-8 text-foreground shadow">
        <h1 className="mb-8 text-center text-3xl font-bold text-green-600">
          Exam Completed
        </h1>

        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Student</span>
            <span>
              {student.firstName} {student.lastName}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Exam</span>
            <span>{attempt.exam.title}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Score</span>
            <span>{attempt.result.score.toString()}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Percentage</span>
            <span>{Number(attempt.result.percentage).toFixed(2)}%</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Grade</span>
            <span className="font-bold text-blue-600">
              {attempt.result.grade}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Completed</span>
            <span>{attempt.result.generatedAt.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
