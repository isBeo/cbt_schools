"use server"
import { AttemptStatus } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function submitExam(formData: FormData) {
  const examId = Number(formData.get("examId"))
  const studentId = Number(formData.get("studentId"))

  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  })

  if (!exam) {
    throw new Error("Exam not found")
  }

  let score = 0
  let totalMarks = 0

  const answers = []

  for (const question of exam.questions) {
    totalMarks += question.marks

    const rawValue = formData.get(`question-${question.id}`)
    const selectedOption = rawValue ? Number(rawValue) : null

    const correctOption = question.options.find((option) => option.isCorrect)

    if (correctOption?.id === selectedOption) {
      score += question.marks
    }

    answers.push({
      questionId: question.id,
      selectedOptionId: selectedOption,
    })
  }

  const attempt = await prisma.examAttempt.create({
    data: {
      studentId,
      examId,
      startedAt: new Date(),
      submittedAt: new Date(),
      status: AttemptStatus.SUBMITTED,
    },
  })

  await prisma.studentAnswer.createMany({
    data: answers.map((answer) => ({
      attemptId: attempt.id,
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      answeredAt: new Date(),
    })),
  })

  const percentage = totalMarks === 0 ? 0 : (score / totalMarks) * 100

  let grade = "F"

  if (percentage >= 70) grade = "A"
  else if (percentage >= 60) grade = "B"
  else if (percentage >= 50) grade = "C"
  else if (percentage >= 45) grade = "D"
  else if (percentage >= 40) grade = "E"

  const result = await prisma.result.create({
    data: {
      attemptId: attempt.id,
      score,
      percentage,
      grade,
    },
  })

  redirect(`/student/${studentId}/result/${result.id}`)
}
