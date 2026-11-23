"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

type QuestionOptionInput = {
  optionText: string
  isCorrect: boolean
  optionOrder?: number
}

type QuestionInput = {
  questionText: string
  marks: number
  classId: number
  subjectId: number
  options: QuestionOptionInput[]
}

async function getAuthorizedTeacher() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("You must be logged in.")
  }

  if (!["TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    throw new Error("You are not authorized to manage questions.")
  }

  if (!session.user.schoolId) {
    throw new Error("Your account is not assigned to a school.")
  }

  const userId = Number(session.user.id)

  if (!Number.isInteger(userId)) {
    throw new Error("Invalid user account.")
  }

  return {
    userId,
    schoolId: session.user.schoolId,
    name: session.user.name || session.user.email || "Unknown user",
    role: session.user.role,
  }
}

function validateQuestionInput(input: QuestionInput) {
  if (!input.questionText?.trim()) {
    throw new Error("Enter the question.")
  }

  if (!Number.isInteger(input.marks) || input.marks <= 0) {
    throw new Error("Marks must be a positive whole number.")
  }

  if (!Number.isInteger(input.classId) || !Number.isInteger(input.subjectId)) {
    throw new Error("Select a valid class and subject.")
  }

  if (!Array.isArray(input.options) || input.options.length < 2) {
    throw new Error("At least two options are required.")
  }

  const options = input.options.map((option) => ({
    optionText: option.optionText.trim(),
    isCorrect: Boolean(option.isCorrect),
  }))

  if (options.some((option) => !option.optionText)) {
    throw new Error("All options must have text.")
  }

  if (options.filter((option) => option.isCorrect).length !== 1) {
    throw new Error("Select exactly one correct answer.")
  }

  return options
}

async function validateTeacherAssignment(
  user: Awaited<ReturnType<typeof getAuthorizedTeacher>>,
  classId: number,
  subjectId: number
) {
  if (user.role === "SCHOOL_ADMIN" || user.role === "SUPER_ADMIN") {
    return
  }

  const assignment = await prisma.teacherAssignment.findFirst({
    where: {
      teacherId: user.userId,
      classId,
      subjectId,
    },
  })

  if (!assignment) {
    throw new Error("You are not assigned to teach this class and subject.")
  }
}

async function validateClassAndSubject(
  schoolId: number,
  classId: number,
  subjectId: number
) {
  const [classRecord, subjectRecord] = await Promise.all([
    prisma.class.findFirst({
      where: { id: classId, schoolId },
    }),
    prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    }),
  ])

  if (!classRecord) {
    throw new Error("Selected class does not belong to your school.")
  }

  if (!subjectRecord) {
    throw new Error("Selected subject does not belong to your school.")
  }
}

export async function createBankQuestion(input: QuestionInput) {
  const user = await getAuthorizedTeacher()
  const options = validateQuestionInput(input)

  await validateTeacherAssignment(user, input.classId, input.subjectId)

  await validateClassAndSubject(
  user.schoolId,
  input.classId,
  input.subjectId
)

  const result = await prisma.$transaction(async (tx) => {
    const question = await tx.bankQuestion.create({
      data: {
        questionText: input.questionText.trim(),
        questionType: "OBJECTIVE",
        marks: input.marks,
        schoolId: user.schoolId,
        classId: input.classId,
        subjectId: input.subjectId,
        createdById: user.userId,
        options: {
          create: options.map((option, index) => ({
            optionText: option.optionText,
            optionOrder: index + 1,
            isCorrect: option.isCorrect,
          })),
        },
      },
    })

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        schoolId: user.schoolId,
        actorName: user.name,
        actorRole: user.role,
        action: "CREATE",
        entity: "BankQuestion",
        entityId: String(question.id),
        description: "Created a question in the Question Bank.",
        metadata: {
          questionText: question.questionText,
          classId: input.classId,
          subjectId: input.subjectId,
          marks: input.marks,
        },
      },
    })

    return question
  })

  revalidatePath("/dashboard/questions")
  revalidatePath("/dashboard/audit-logs")

  return {
    success: true,
    questionId: result.id,
  }
}

export async function updateBankQuestion(
  questionId: number,
  input: QuestionInput
) {
  const user = await getAuthorizedTeacher()
  const options = validateQuestionInput(input)

  if (!Number.isInteger(questionId)) {
    throw new Error("Invalid question.")
  }

  await validateTeacherAssignment(user, input.classId, input.subjectId)

 await validateClassAndSubject(
  user.schoolId,
  input.classId,
  input.subjectId
)

  const existing = await prisma.bankQuestion.findFirst({
    where: {
      id: questionId,
      schoolId: user.schoolId,
      isActive: true,
    },
  })

  if (!existing) {
    throw new Error("Question not found.")
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.bankQuestion.update({
      where: { id: questionId },
      data: {
        questionText: input.questionText.trim(),
        marks: input.marks,
        classId: input.classId,
        subjectId: input.subjectId,
        options: {
          deleteMany: {},
          create: options.map((option, index) => ({
            optionText: option.optionText,
            optionOrder: index + 1,
            isCorrect: option.isCorrect,
          })),
        },
      },
    })

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        schoolId: user.schoolId,
        actorName: user.name,
        actorRole: user.role,
        action: "UPDATE",
        entity: "BankQuestion",
        entityId: String(questionId),
        description: "Updated a Question Bank question.",
        metadata: {
          old: {
            questionText: existing.questionText,
            marks: existing.marks,
            classId: existing.classId,
            subjectId: existing.subjectId,
          },
          new: {
            questionText: updated.questionText,
            marks: updated.marks,
            classId: updated.classId,
            subjectId: updated.subjectId,
          },
        },
      },
    })

    return updated
  })

  revalidatePath("/dashboard/questions")
  revalidatePath("/dashboard/audit-logs")

  return {
    success: true,
    questionId: result.id,
  }
}

export async function archiveBankQuestion(questionId: number) {
  const user = await getAuthorizedTeacher()

  if (!Number.isInteger(questionId)) {
    throw new Error("Invalid question.")
  }

  const existing = await prisma.bankQuestion.findFirst({
    where: {
      id: questionId,
      schoolId: user.schoolId,
      isActive: true,
    },
  })

  if (!existing) {
    throw new Error("Question not found.")
  }

  await validateTeacherAssignment(user, existing.classId, existing.subjectId)

  await prisma.$transaction(async (tx) => {
    await tx.bankQuestion.update({
      where: { id: questionId },
      data: { isActive: false },
    })

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        schoolId: user.schoolId,
        actorName: user.name,
        actorRole: user.role,
        action: "ARCHIVE",
        entity: "BankQuestion",
        entityId: String(questionId),
        description: "Archived a Question Bank question.",
        metadata: {
          questionText: existing.questionText,
        },
      },
    })
  })

  revalidatePath("/dashboard/questions")
  revalidatePath("/dashboard/audit-logs")

  return { success: true }
}
