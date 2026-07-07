import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{
    attemptId: string
  }>
}

export default async function ResultPage({ params }: Props) {
  const { attemptId } = await params

  const attempt = await prisma.examAttempt.findUnique({
    where: {
      id: Number(attemptId),
    },
    include: {
      student: true,
      exam: true,
      result: true,
    },
  })

  if (!attempt || !attempt.result) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl border bg-white p-8 shadow">
        <h1 className="mb-8 text-center text-3xl font-bold text-green-600">
          Exam Completed
        </h1>

        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Student</span>
            <span>
              {attempt.student.firstName} {attempt.student.lastName}
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
            <span>{attempt.result.percentage.toFixed(2)}%</span>
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
