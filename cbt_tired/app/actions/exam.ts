
"use server"

import { QUESTION_BANKS } from "@/lib/question_banks"
import { auth } from "@/auth"
import { loadQuestions } from "@/lib/question-loader"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

// VERIFY THAT THE CURRENT USER CAN MANAGE AN EXAM
async function getAuthorizedExam(examId: number) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("You must be logged in.")
  }

  if (!Number.isInteger(examId) || examId <= 0) {
    throw new Error("Invalid exam ID.")
  }

  const { id, role, schoolId } = session.user

  if (
    role !== "SUPER_ADMIN" &&
    role !== "SCHOOL_ADMIN" &&
    role !== "TEACHER"
  ) {
    throw new Error("You are not authorized to manage exams.")
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      class: {
        select: { schoolId: true },
      },
    },
  })

  if (!exam) {
    throw new Error("Exam not found.")
  }

  if (role === "SUPER_ADMIN") return exam

  if (role === "SCHOOL_ADMIN") {
    if (!schoolId || exam.class.schoolId !== schoolId) {
      throw new Error("You cannot manage this school's exam.")
    }

    return exam
  }

  const teacherId = Number(id)

  if (!Number.isInteger(teacherId)) {
    throw new Error("Invalid teacher account.")
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
    throw new Error("You are not assigned to this class and subject.")
  }

  return exam
}

// IMPORT EXAM QUESTIONS
export async function importExamQuestions(examId: number) {
  const exam = await getAuthorizedExam(examId)

  if (!exam.questionSource) {
    throw new Error("No question source selected.")
  }

  if (exam.status !== "PUBLISHED") {
    throw new Error("Questions can only be imported into a published exam.")
  }

  const validQuestionSource = QUESTION_BANKS.some(
    (bank) => bank.value === exam.questionSource
  )

  if (!validQuestionSource) {
    throw new Error("This exam has an invalid question source.")
  }

  const questions = await loadQuestions(exam.questionSource)

  if (!questions.length) {
    throw new Error("No questions found in source.")
  }

  const existing = await prisma.question.count({
    where: { examId: exam.id },
  })

  if (existing > 0) {
    revalidatePath("/dashboard/exams")
    revalidatePath(`/dashboard/exams/${exam.id}/questions`)
    return
  }

  await prisma.$transaction(
    async (tx) => {
      for (const [index, q] of questions.entries()) {
        await tx.question.create({
          data: {
            examId: exam.id,
            questionText: q.questionText,
            questionType: "OBJECTIVE",
            marks: q.marks,
            questionOrder: index + 1,
            options: {
              create: q.options.map((option, optionIndex) => ({
                optionText: option.text,
                optionOrder: optionIndex + 1,
                isCorrect: option.correct,
              })),
            },
          },
        })
      }
    },
    {
      maxWait: 15000,
      timeout: 60000,
    }
  )

  revalidatePath("/dashboard/exams")
  revalidatePath(`/dashboard/exams/${exam.id}/questions`)
}

// START OR RESUME A STUDENT EXAM
export async function startExam(examId: number) {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("You are not authorized to start this exam.")
  }

  const userId = Number(session.user.id)

  if (
    !Number.isInteger(userId) ||
    !Number.isInteger(examId) ||
    examId <= 0
  ) {
    throw new Error("Invalid exam details.")
  }

  const student = await prisma.student.findUnique({
    where: { userId },
  })

  if (!student) {
    throw new Error("Student record not found.")
  }

  const now = new Date()

  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      classId: student.classId,
      status: "ACTIVE",
      AND: [
        {
          OR: [
            { startTime: null },
            { startTime: { lte: now } },
          ],
        },
        {
          OR: [
            { endTime: null },
            { endTime: { gte: now } },
          ],
        },
      ],
    },
  })

  if (!exam) {
    throw new Error("This exam is unavailable to you.")
  }

  if (exam.durationMinutes <= 0) {
    throw new Error("This exam has an invalid duration.")
  }

  const existingAttempt = await prisma.examAttempt.findUnique({
    where: {
      studentId_examId: {
        studentId: student.id,
        examId: exam.id,
      },
    },
  })

  if (existingAttempt && existingAttempt.status !== "IN_PROGRESS") {
    throw new Error("You have already attempted this exam.")
  }

  let attempt = existingAttempt

  if (!attempt) {
    try {
      attempt = await prisma.examAttempt.create({
        data: {
          studentId: student.id,
          examId: exam.id,
          startedAt: now,
          status: "IN_PROGRESS",
        },
      })
    } catch (error) {
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? error.code
          : undefined

      if (errorCode !== "P2002") throw error

      attempt = await prisma.examAttempt.findUnique({
        where: {
          studentId_examId: {
            studentId: student.id,
            examId: exam.id,
          },
        },
      })

      if (!attempt || attempt.status !== "IN_PROGRESS") {
        throw new Error("You have already attempted this exam.")
      }
    }
  }

  const durationDeadline = new Date(
    attempt.startedAt.getTime() + exam.durationMinutes * 60 * 1000
  )

  const expiresAt =
    exam.endTime && exam.endTime < durationDeadline
      ? exam.endTime
      : durationDeadline

  return {
    attemptId: attempt.id,
    startedAt: attempt.startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
}




type SubmitExamInput = {
  examId: number
  attemptId: number
  answers: Record<number, number>
}

// SUBMIT STUDENT EXAM
export async function submitExam(data: SubmitExamInput) {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("You are not authorized to submit this exam.")
  }

  const userId = Number(session.user.id)

  if (
    !Number.isInteger(userId) ||
    !Number.isInteger(data.examId) ||
    data.examId <= 0 ||
    !Number.isInteger(data.attemptId) ||
    data.attemptId <= 0
  ) {
    throw new Error("Invalid exam submission.")
  }

  if (
    !data.answers ||
    typeof data.answers !== "object" ||
    Array.isArray(data.answers)
  ) {
    throw new Error("Invalid exam answers.")
  }

  const GRACE_PERIOD_MS = 15 * 1000

  // Return the saved result if this attempt was already submitted.
  async function getExistingResult() {
    const attempt = await prisma.examAttempt.findUnique({
      where: {
        studentId_examId: {
          studentId: studentId,
          examId: data.examId,
        },
      },
      include: {
        result: true,
      },
    })

    if (
      !attempt ||
      attempt.id !== data.attemptId ||
      (attempt.status !== "SUBMITTED" && attempt.status !== "GRADED") ||
      !attempt.result
    ) {
      return null
    }

    return {
      success: true,
      attemptId: attempt.id,
      resultId: attempt.result.id,
      score: Number(attempt.result.score),
      percentage: Number(attempt.result.percentage),
      grade: attempt.result.grade,
    }
  }

  const studentRecord = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!studentRecord) {
    throw new Error("Student record not found.")
  }

  const studentId = studentRecord.id

  try {
    return await prisma.$transaction(
      async (tx) => {
        const now = new Date()

        const student = await tx.student.findUnique({
          where: { id: studentId },
        })

        if (!student) {
          throw new Error("Student record not found.")
        }

        const exam = await tx.exam.findFirst({
          where: {
            id: data.examId,
            classId: student.classId,
            status: "ACTIVE",
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
          throw new Error("This exam is unavailable to you.")
        }

        if (exam.questions.length === 0) {
          throw new Error("This exam has no questions.")
        }

        const attempt = await tx.examAttempt.findUnique({
          where: {
            studentId_examId: {
              studentId: student.id,
              examId: exam.id,
            },
          },
        })

        if (!attempt || attempt.id !== data.attemptId) {
          throw new Error("This exam attempt is invalid.")
        }

        // IDEMPOTENCY: return the existing result on a retry.
        if (attempt.status !== "IN_PROGRESS") {
          const existingResult = await tx.result.findUnique({
            where: { attemptId: attempt.id },
          })

          if (!existingResult) {
            throw new Error(
              "This attempt was submitted, but its result is unavailable. Contact your school administrator."
            )
          }

          return {
            success: true,
            attemptId: attempt.id,
            resultId: existingResult.id,
            score: Number(existingResult.score),
            percentage: Number(existingResult.percentage),
            grade: existingResult.grade,
          }
        }

        const durationDeadline = new Date(
          attempt.startedAt.getTime() +
            exam.durationMinutes * 60 * 1000
        )

        const expiresAt =
          exam.endTime && exam.endTime < durationDeadline
            ? exam.endTime
            : durationDeadline

        if (now.getTime() > expiresAt.getTime() + GRACE_PERIOD_MS) {
          throw new Error("Your exam submission deadline has passed.")
        }

        const questionMap = new Map(
          exam.questions.map((question) => [question.id, question])
        )

        for (const [questionId, optionId] of Object.entries(data.answers)) {
          const parsedQuestionId = Number(questionId)
          const parsedOptionId = Number(optionId)

          const question = questionMap.get(parsedQuestionId)

          if (
            !question ||
            !Number.isInteger(parsedOptionId) ||
            !question.options.some(
              (option) => option.id === parsedOptionId
            )
          ) {
            throw new Error("Invalid answer submitted.")
          }
        }

        const updatedAttempt = await tx.examAttempt.updateMany({
          where: {
            id: attempt.id,
            studentId: student.id,
            examId: exam.id,
            status: "IN_PROGRESS",
          },
          data: {
            submittedAt: now,
            status: "SUBMITTED",
          },
        })

        if (updatedAttempt.count !== 1) {
          throw new Error("SUBMISSION_ALREADY_PROCESSED")
        }

        let score = 0
        let totalMarks = 0

        const answersToCreate = exam.questions.map((question) => {
          totalMarks += question.marks

          const selectedOptionId =
            data.answers[question.id] !== undefined
              ? Number(data.answers[question.id])
              : null

          const correctOption = question.options.find(
            (option) => option.isCorrect
          )

          const isCorrect = correctOption?.id === selectedOptionId
          const marksAwarded = isCorrect ? question.marks : 0

          score += marksAwarded

          return {
            attemptId: attempt.id,
            questionId: question.id,
            selectedOptionId,
            answeredAt: now,
            isCorrect,
            marksAwarded,
          }
        })

        await tx.studentAnswer.createMany({
          data: answersToCreate.map((answer) => ({
            attemptId: answer.attemptId,
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
            answeredAt: answer.answeredAt,
          })),
        })

        const percentage =
          totalMarks === 0 ? 0 : (score / totalMarks) * 100

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

        await tx.resultDetail.createMany({
          data: answersToCreate.map((answer) => ({
            resultId: result.id,
            questionId: answer.questionId,
            isCorrect: answer.isCorrect,
            marksAwarded: answer.marksAwarded,
          })),
        })

        return {
          success: true,
          attemptId: attempt.id,
          resultId: result.id,
          score,
          percentage,
          grade,
        }
      },
      {
        maxWait: 15000,
        timeout: 60000,
      }
    )
  } catch (error) {
    // A concurrent request may have completed the submission.
    // Check the database before returning an error.
    const existingResult = await getExistingResult()

    if (existingResult) {
      return existingResult
    }

    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? error.code
        : undefined

    if (errorCode === "P2002") {
      throw new Error("This exam submission already exists.")
    }

    if (errorCode === "P2034") {
      throw new Error(
        "Your submission encountered a database conflict. Please try again."
      )
    }

    throw error
  }
}


// ACTIVATE OR REOPEN EXAM
export async function activateExam(examId: number) {
  const exam = await getAuthorizedExam(examId)

  if (exam.status !== "PUBLISHED" && exam.status !== "CLOSED") {
    throw new Error("Only published or closed exams can be activated.")
  }

  const questionCount = await prisma.question.count({
    where: { examId: exam.id },
  })

  if (questionCount === 0) {
    throw new Error("Import questions before activating this exam.")
  }

  await prisma.exam.update({
    where: { id: exam.id },
    data: { status: "ACTIVE" },
  })

  revalidatePath("/dashboard/exams")
}

// PUBLISH EXAM
export async function publishExam(examId: number) {
  const exam = await getAuthorizedExam(examId)

  if (exam.status !== "DRAFT") {
    throw new Error("Only draft exams can be published.")
  }

  await prisma.exam.update({
    where: { id: exam.id },
    data: { status: "PUBLISHED" },
  })

  revalidatePath("/dashboard/exams")
}

// CLOSE EXAM
export async function closeExam(examId: number) {
  const exam = await getAuthorizedExam(examId)

  if (exam.status !== "ACTIVE") {
    throw new Error("Only active exams can be closed.")
  }

  await prisma.exam.update({
    where: { id: exam.id },
    data: { status: "CLOSED" },
  })

  revalidatePath("/dashboard/exams")
}

// RETURN EXAM TO DRAFT
export async function draftExam(examId: number) {
  const exam = await getAuthorizedExam(examId)

  if (exam.status !== "PUBLISHED") {
    throw new Error("Only published exams can be returned to draft.")
  }

  await prisma.exam.update({
    where: { id: examId },
    data: { status: "DRAFT" },
  })

  revalidatePath("/dashboard/exams")
}

// CREATE EXAM FROM DATABASE QUESTION BANK
export async function createExam(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("You must be logged in.")
  }

  const { id, role, schoolId } = session.user

  if (
    role !== "SUPER_ADMIN" &&
    role !== "SCHOOL_ADMIN" &&
    role !== "TEACHER"
  ) {
    throw new Error("You are not authorized to create exams.")
  }

  const title = formData.get("title")
  const term = formData.get("term")
  const sessionName = formData.get("session")

  const durationMinutes = Number(formData.get("durationMinutes"))
  const classId = Number(formData.get("classId"))
  const subjectId = Number(formData.get("subjectId"))

  const bankQuestionIds = formData
    .getAll("bankQuestionIds")
    .map((value) => Number(value))

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof term !== "string" ||
    !term.trim() ||
    typeof sessionName !== "string" ||
    !sessionName.trim()
  ) {
    throw new Error("Please provide all required exam details.")
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    !Number.isInteger(classId) ||
    classId <= 0 ||
    !Number.isInteger(subjectId) ||
    subjectId <= 0 ||
    bankQuestionIds.length === 0 ||
    bankQuestionIds.some((id) => !Number.isInteger(id) || id <= 0) ||
    new Set(bankQuestionIds).size !== bankQuestionIds.length
  ) {
    throw new Error("Invalid exam details or question selection.")
  }

  const [classRecord, subjectRecord] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, schoolId: true },
    }),
    prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, schoolId: true },
    }),
  ])

  if (!classRecord || !subjectRecord) {
    throw new Error("Selected class or subject does not exist.")
  }

  if (classRecord.schoolId !== subjectRecord.schoolId) {
    throw new Error("Class and subject must belong to the same school.")
  }

  if (role === "SCHOOL_ADMIN") {
    if (!schoolId || classRecord.schoolId !== schoolId) {
      throw new Error("You can only create exams for your own school.")
    }
  }

  if (role === "TEACHER") {
    const teacherId = Number(id)

    if (!Number.isInteger(teacherId)) {
      throw new Error("Invalid teacher account.")
    }

    const assignment = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_classId_subjectId: {
          teacherId,
          classId,
          subjectId,
        },
      },
    })

    if (!assignment) {
      throw new Error("You are not assigned to this class and subject.")
    }
  }

  const bankQuestions = await prisma.bankQuestion.findMany({
    where: {
      id: { in: bankQuestionIds },
      schoolId: classRecord.schoolId,
      classId,
      subjectId,
      isActive: true,
    },
    include: {
      options: {
        orderBy: { optionOrder: "asc" },
      },
    },
  })

  if (bankQuestions.length !== bankQuestionIds.length) {
    throw new Error(
      "Some selected questions are unavailable or do not belong to this class and subject."
    )
  }

  if (
    bankQuestions.some(
      (question) =>
        question.options.length < 2 ||
        !question.options.some((option) => option.isCorrect)
    )
  ) {
    throw new Error(
      "Every selected objective question must have at least two options and a correct answer."
    )
  }

  const totalMarks = bankQuestions.reduce(
    (total, question) => total + question.marks,
    0
  )

  if (totalMarks <= 0) {
    throw new Error("The selected questions have invalid total marks.")
  }

  const orderedQuestions = bankQuestionIds.map(
    (questionId) =>
      bankQuestions.find((question) => question.id === questionId)!
  )

  await prisma.$transaction(
    async (tx) => {
      const exam = await tx.exam.create({
        data: {
          title: title.trim(),
          term: term.trim(),
          session: sessionName.trim(),
          durationMinutes,
          totalMarks,
          classId,
          subjectId,
        },
      })

      for (const [index, bankQuestion] of orderedQuestions.entries()) {
        await tx.question.create({
          data: {
            examId: exam.id,
            sourceBankQuestionId: bankQuestion.id,
            questionText: bankQuestion.questionText,
            questionType: bankQuestion.questionType,
            marks: bankQuestion.marks,
            questionOrder: index + 1,
            options: {
              create: bankQuestion.options.map((option) => ({
                optionText: option.optionText,
                optionOrder: option.optionOrder,
                isCorrect: option.isCorrect,
              })),
            },
          },
        })
      }
    },
    {
      maxWait: 15000,
      timeout: 60000,
    }
  )

  revalidatePath("/dashboard/exams")
  redirect("/dashboard/exams")
}

// DELETE EXAM
export async function deleteExam(examId: number) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("You must be logged in.")
  }

  const { role, schoolId } = session.user

  if (role !== "SUPER_ADMIN" && role !== "SCHOOL_ADMIN") {
    throw new Error("You are not authorized to delete exams.")
  }

  if (!Number.isInteger(examId) || examId <= 0) {
    throw new Error("Invalid exam ID.")
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      class: {
        select: { schoolId: true },
      },
      _count: {
        select: { attempts: true },
      },
    },
  })

  if (!exam) {
    throw new Error("Exam not found.")
  }

  if (
    role === "SCHOOL_ADMIN" &&
    (!schoolId || exam.class.schoolId !== schoolId)
  ) {
    throw new Error("You cannot delete another school's exam.")
  }

  if (exam.status !== "DRAFT") {
    throw new Error("Only draft exams can be deleted.")
  }

  if (exam._count.attempts > 0) {
    throw new Error("This exam has student attempts and cannot be deleted.")
  }

  await prisma.$transaction(
    async (tx) => {
      const currentExam = await tx.exam.findUnique({
        where: { id: examId },
        include: {
          _count: {
            select: { attempts: true },
          },
        },
      })

      if (!currentExam || currentExam.status !== "DRAFT") {
        throw new Error("This exam can no longer be deleted.")
      }

      if (currentExam._count.attempts > 0) {
        throw new Error("This exam has student attempts and cannot be deleted.")
      }

      await tx.option.deleteMany({
        where: {
          question: { examId },
        },
      })

      await tx.question.deleteMany({
        where: { examId },
      })

      await tx.exam.delete({
        where: { id: examId },
      })
    },
    {
      maxWait: 15000,
      timeout: 60000,
    }
  )

  revalidatePath("/dashboard/exams")
}
