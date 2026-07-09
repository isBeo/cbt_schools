"use server"
import { loadQuestions } from "@/lib/question-loader"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function importExamQuestions(examId: number) {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  })

  if (!exam) {
    throw new Error("Exam not found.")
  }
  if (!exam.questionSource) {
    throw new Error("No question source selected.")
  }

  const questions = await loadQuestions(exam.questionSource)

  if (!questions.length) {
    throw new Error("No questions found in source.")
  }

  const existing = await prisma.question.count({
    where: {
      examId: exam.id,
    },
  })

  
 if (existing > 0) {
   revalidatePath("/dashboard/exams")
   return
 }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]

    await prisma.question.create({
      data: {
        examId: exam.id,
        questionText: q.questionText,
        questionType: "OBJECTIVE",
        marks: q.marks,
        questionOrder: i + 1,

        options: {
          create: q.options.map((option, index) => ({
            optionText: option.text,
            optionOrder: index + 1,
            isCorrect: option.correct,
          })),
        },
      },
    })
  }
  revalidatePath("/dashboard/exams")
  return
}

// export async function submitExam() {}

type SubmitExamInput = {
  studentId: number
  examId: number
  answers: Record<number, number>
}

export async function submitExam(data: SubmitExamInput) {
  // Fetch questions BEFORE starting the transaction
  const questions = await prisma.question.findMany({
    where: {
      examId: data.examId,
    },
    include: {
      options: true,
    },
  })

  const questionMap = new Map(questions.map((q) => [q.id, q]))

  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.examAttempt.create({
      data: {
        studentId: data.studentId,
        examId: data.examId,
        startedAt: new Date(),
        submittedAt: new Date(),
        status: "SUBMITTED",
      },
    })

    let score = 0
    let totalMarks = 0

    const answersToCreate: {
      attemptId: number
      questionId: number
      selectedOptionId: number
      answeredAt: Date
    }[] = []

    for (const [questionId, optionId] of Object.entries(data.answers)) {
      const question = questionMap.get(Number(questionId))

      if (!question) continue

      totalMarks += question.marks

      const selectedOptionId = Number(optionId)

      const correctOption = question.options.find((option) => option.isCorrect)

      if (correctOption?.id === selectedOptionId) {
        score += question.marks
      }

      answersToCreate.push({
        attemptId: attempt.id,
        questionId: Number(questionId),
        selectedOptionId,
        answeredAt: new Date(),
      })
    }

    await tx.studentAnswer.createMany({
      data: answersToCreate,
    })

    const percentage = totalMarks === 0 ? 0 : (score / totalMarks) * 100

    let grade = "F"

    if (percentage >= 70) grade = "A"
    else if (percentage >= 60) grade = "B"
    else if (percentage >= 50) grade = "C"
    else if (percentage >= 45) grade = "D"
    else if (percentage >= 40) grade = "E"

    const result = await tx.result.create({
      data: {
        attemptId: attempt.id,
        score,
        percentage,
        grade,
      },
    })

    return {
      success: true,
      attemptId: attempt.id,
      resultId: result.id,
      score,
      percentage,
      grade,
    }
  })
}

export async function activateExam(examId: number) {
  await prisma.exam.update({
    where: {
      id: examId,
    },
    data: {
      status: "ACTIVE",
    },
  })

  revalidatePath("/dashboard/exams")
}

export async function publishExam(examId: number) {
  await prisma.exam.update({
    where: {
      id: examId,
    },
    data: {
      status: "PUBLISHED",
    },
  })

  revalidatePath("/dashboard/exams")
}

export async function closeExam(examId: number) {
  await prisma.exam.update({
    where: {
      id: examId,
    },
    data: {
      status: "CLOSED",
    },
  })

  revalidatePath("/dashboard/exams")
}

export async function draftExam(examId: number) {
  await prisma.exam.update({
    where: {
      id: examId,
    },
    data: {
      status: "DRAFT",
    },
  })

  revalidatePath("/dashboard/exams")
}
export async function createExam(formData: FormData) {
  const title = formData.get("title") as string
  const term = formData.get("term") as string
  const session = formData.get("session") as string

  const durationMinutes = Number(formData.get("durationMinutes"))
  const totalMarks = Number(formData.get("totalMarks"))

  const classId = Number(formData.get("classId"))
  const subjectId = Number(formData.get("subjectId"))

  const questionSource = formData.get("questionSource") as string

  await prisma.exam.create({
    data: {
      title,
      term,
      session,
      durationMinutes,
      totalMarks,
      classId,
      subjectId,
      questionSource,
    },
  })

  revalidatePath("/dashboard/exams")
  redirect("/dashboard/exams")
}
