import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { importExamQuestions } from "@/app/actions/exam"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function QuestionsPage({ params }: Props) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id: userId, role, schoolId } = session.user
  const { id } = await params
  const examId = Number(id)

  if (!Number.isInteger(examId) || examId <= 0) {
    notFound()
  }

  if (role !== "SUPER_ADMIN" && role !== "SCHOOL_ADMIN" && role !== "TEACHER") {
    notFound()
  }

  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
    include: {
      class: {
        select: {
          schoolId: true,
        },
      },
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

  // Super Admin can manage exams across all schools.
  if (role === "SUPER_ADMIN") {
    // No additional school restriction.
  } else if (role === "SCHOOL_ADMIN") {
    if (!schoolId || exam.class.schoolId !== schoolId) {
      notFound()
    }
  } else if (role === "TEACHER") {
    const teacherId = Number(userId)

    if (!Number.isInteger(teacherId)) {
      notFound()
    }

    const assignment = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_classId_subjectId: {
          teacherId,
          classId: exam.classId,
          subjectId: exam.subjectId,
        },
      },
    })

    if (!assignment) {
      notFound()
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">{exam.title}</h1>

        <p>{exam.questionSource}</p>

        <p>{exam.questions.length} Questions</p>
      </div>

      {exam.questions.length === 0 && exam.status === "PUBLISHED" && (
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
