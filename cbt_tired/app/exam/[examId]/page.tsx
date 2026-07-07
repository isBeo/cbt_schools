import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ExamForm } from "@/components/forms/ExamForm"


type Props = {
  params: Promise<{
    examId: string
  }>
  searchParams: Promise<{
    student?: string
  }>
}

export default async function ExamPage({ params, searchParams }: Props) {
 
 
  const { examId } = await params
  const { student } = await searchParams
 
 
 
  if (!student) {
    notFound()
  }




//  const exam = await prisma.exam.findFirst({
//    where: {
//      id: Number(examId),
//      status: ExamStatus.ACTIVE,
//    },
//    include: {
//      questions: {
//        include: {
//          options: true,
//        },
//        orderBy: {
//          questionOrder: "asc",
//        },
//      },
//    },
//  })

const exam = await prisma.exam.findUnique({
  where: {
    id: Number(examId),
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
      <ExamForm
        exam={exam}
        studentId={Number(student)}
        duration={exam.durationMinutes}
      />{" "}
    </main>
  )
}
