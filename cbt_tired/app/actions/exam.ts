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
        select: {
          schoolId: true,
        },
      },
    },
  })

  if (!exam) {
    throw new Error("Exam not found.")
  }

  // Super Admin can manage exams across all schools.
  if (role === "SUPER_ADMIN") {
    return exam
  }

  // School Admin can manage exams belonging to their school.
  if (role === "SCHOOL_ADMIN") {
    if (!schoolId || exam.class.schoolId !== schoolId) {
      throw new Error("You cannot manage this school's exam.")
    }

    return exam
  }

  // Teacher must have the exact class-and-subject assignment.
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

  const questions = await loadQuestions(exam.questionSource)

  if (!questions.length) {
    throw new Error("No questions found in source.")
  }

  const existing = await prisma.question.count({
    where: { examId: exam.id },
  })

  if (existing > 0) {
    revalidatePath("/dashboard/exams")
    return
  }

  await prisma.$transaction(
    questions.map((q, index) =>
      prisma.question.create({
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
    )
  )

  revalidatePath("/dashboard/exams")
  revalidatePath(`/dashboard/exams/${exam.id}/questions`)
}



// SUBMIT EXAM
type SubmitExamInput = {
  examId: number
  answers: Record<number, number>
}

export async function submitExam(data: SubmitExamInput) {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("You are not authorized to submit this exam.")
  }

  const userId = Number(session.user.id)

  if (
    !Number.isInteger(userId) ||
    !Number.isInteger(data.examId) ||
    data.examId <= 0
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

  const now = new Date()

  try {
    return await prisma.$transaction(
      async (tx) => {
        // Identify the student using the authenticated account.
        const student = await tx.student.findUnique({
          where: { userId },
        })

        if (!student) {
          throw new Error("Student record not found.")
        }

        // Verify exam availability and class ownership.
        const exam = await tx.exam.findFirst({
          where: {
            id: data.examId,
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

        // Check for an existing attempt.
        const existingAttempt = await tx.examAttempt.findUnique({
          where: {
            studentId_examId: {
              studentId: student.id,
              examId: exam.id,
            },
          },
        })

        if (existingAttempt) {
          throw new Error("You have already attempted this exam.")
        }

        const questionMap = new Map(
          exam.questions.map((question) => [
            question.id,
            question,
          ])
        )

        // Validate every submitted answer.
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

        // Create the attempt.
        const attempt = await tx.examAttempt.create({
          data: {
            studentId: student.id,
            examId: exam.id,
            startedAt: now,
            submittedAt: now,
            status: "SUBMITTED",
          },
        })

        let score = 0
        let totalMarks = 0

        // Record all questions, including unanswered questions.
        const answersToCreate = exam.questions.map((question) => {
          totalMarks += question.marks

          const selectedOptionId =
            data.answers[question.id] !== undefined
              ? Number(data.answers[question.id])
              : null

          const correctOption = question.options.find(
            (option) => option.isCorrect
          )

          if (correctOption?.id === selectedOptionId) {
            score += question.marks
          }

          return {
            attemptId: attempt.id,
            questionId: question.id,
            selectedOptionId,
            answeredAt: now,
          }
        })

        await tx.studentAnswer.createMany({
          data: answersToCreate,
        })

        // Calculate result.
        const percentage =
          totalMarks === 0
            ? 0
            : (score / totalMarks) * 100

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
      },
      {
        isolationLevel: "Serializable",
      }
    )
  } catch (error) {
    // Handle database uniqueness and transaction conflicts.
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? error.code
        : undefined

    if (errorCode === "P2002" || errorCode === "P2034") {
      const student = await prisma.student.findUnique({
        where: { userId },
      })

      if (student) {
        const existingAttempt = await prisma.examAttempt.findUnique({
          where: {
            studentId_examId: {
              studentId: student.id,
              examId: data.examId,
            },
          },
        })

        if (existingAttempt) {
          throw new Error("You have already attempted this exam.")
        }
      }

      if (errorCode === "P2034") {
        throw new Error(
          "Your submission encountered a database conflict. Please try again."
        )
      }
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
    where: { id: exam.id },
    data: { status: "DRAFT" },
  })

  revalidatePath("/dashboard/exams")
}




// CREATE EXAM
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
  const questionSource = formData.get("questionSource")

  const durationMinutes = Number(formData.get("durationMinutes"))
  const totalMarks = Number(formData.get("totalMarks"))
  const classId = Number(formData.get("classId"))
  const subjectId = Number(formData.get("subjectId"))

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof term !== "string" ||
    !term.trim() ||
    typeof sessionName !== "string" ||
    !sessionName.trim() ||
    typeof questionSource !== "string" ||
    !questionSource.trim()
  ) {
    throw new Error("Please provide all required exam details.")
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    !Number.isInteger(totalMarks) ||
    totalMarks <= 0 ||
    !Number.isInteger(classId) ||
    classId <= 0 ||
    !Number.isInteger(subjectId) ||
    subjectId <= 0
  ) {
    throw new Error("Invalid exam details.")
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

  await prisma.exam.create({
    data: {
      title: title.trim(),
      term: term.trim(),
      session: sessionName.trim(),
      durationMinutes,
      totalMarks,
      classId,
      subjectId,
      questionSource: questionSource.trim(),
    },
  })

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
        select: {
          schoolId: true,
        },
      },
      _count: {
        select: {
          attempts: true,
        },
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
    throw new Error(
      "This exam has student attempts and cannot be deleted."
    )
  }

  await prisma.$transaction(async (tx) => {
    const currentExam = await tx.exam.findUnique({
      where: { id: examId },
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    })

    if (!currentExam || currentExam.status !== "DRAFT") {
      throw new Error("This exam can no longer be deleted.")
    }

    if (currentExam._count.attempts > 0) {
      throw new Error("This exam has student attempts and cannot be deleted.")
    }

    // Remove options belonging to the exam's questions.
    await tx.option.deleteMany({
      where: {
        question: {
          examId,
        },
      },
    })

    // Remove questions belonging to the exam.
    await tx.question.deleteMany({
      where: { examId },
    })

    // Finally remove the exam.
    await tx.exam.delete({
      where: { id: examId },
    })
  })

  revalidatePath("/dashboard/exams")
}
