import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { importExamQuestions } from "@/app/actions/exam"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function QuestionsPage({ params }: Props) {
  const { id } = await params

  const exam = await prisma.exam.findUnique({
    where: {
      id: Number(id),
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
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">{exam.title}</h1>

        <p>{exam.questionSource}</p>

        <p>{exam.questions.length} Questions</p>
      </div>

      {exam.questions.length === 0 && (
        <form action={importExamQuestions.bind(null, exam.id)}>
          <Button type="submit">Import Questions</Button>
        </form>
      )}

      {exam.questions.length > 0 && (
        <div className="space-y-4">
          {exam.questions.map((question) => (
            <div key={question.id} className="rounded-lg border p-4">
              <h3 className="font-semibold">
                {question.questionOrder}. {question.questionText}
              </h3>

              <ul className="mt-2 ml-6 list-disc">
                {question.options.map((option) => (
                  <li key={option.id}>
                    {option.optionText}
                    {option.isCorrect && " ✅"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
