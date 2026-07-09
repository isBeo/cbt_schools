"use server"

import { prisma } from "@/lib/prisma"

type Question = {
  questionText: string
  marks: number
  options: {
    text: string
    correct: boolean
  }[]
}

/**
 * Inserts a list of questions and options for a single exam.
 *
 * The expected question format is:
 * {
 *   questionText: string,
 *   marks: number,
 *   options: { text: string, correct: boolean }[]
 * }
 *
 * The helper will fail if the exam already contains questions.
 */
export async function insertQuestions(examId: number, questions: Question[]) {
  const existing = await prisma.question.count({
    where: {
      examId,
    },
  })

  if (existing > 0) {
    return {
      success: false,
      message: "Questions have already been imported.",
    }
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]

    await prisma.question.create({
      data: {
        examId,
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

  return {
    success: true,
    message: `${questions.length} questions imported successfully.`,
  }
}
