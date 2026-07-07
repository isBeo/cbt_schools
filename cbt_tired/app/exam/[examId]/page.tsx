import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ExamForm } from "@/components/forms/ExamForm"


type Props = {
  params: Promise<{
    examId: string
  }>
}

export default async function ExamPage({ params }: Props) {
  const { examId } = await params

  const exam = await prisma.exam.findUnique({
    where: {
      id: Number(examId),
      status: "Active"
    },
    include: {
      questions: {
        include: {
          options: true,
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

  return (
    <main className="mx-auto max-w-4xl p-6">
      <ExamForm exam={exam} />
    </main>
  )
}
