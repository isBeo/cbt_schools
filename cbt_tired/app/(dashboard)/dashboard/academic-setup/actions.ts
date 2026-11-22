"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const route = "/dashboard/academic-setup"

async function getSchoolAdmin() {
  const session = await auth()

  if (
    !session?.user ||
    session.user.role !== "SCHOOL_ADMIN" ||
    !session.user.schoolId
  ) {
    return null
  }

  return {
    userId: session.user.id,
    schoolId: session.user.schoolId,
  }
}

const transactionOptions = {
  maxWait: 10000,
  timeout: 20000,
}

export async function createAcademicSession(name: string) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return {
      success: false,
      message: "You are not authorised to perform this action.",
    }
  }

  const sessionName = name.trim()

  if (!/^\d{4}\/\d{4}$/.test(sessionName)) {
    return {
      success: false,
      message: "Enter the session in this format: 2026/2027.",
    }
  }

  const [startYear, endYear] = sessionName.split("/").map(Number)

  if (endYear !== startYear + 1) {
    return {
      success: false,
      message: "The second year must be one year after the first.",
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.academicSession.findUnique({
        where: {
          schoolId_name: {
            schoolId: admin.schoolId,
            name: sessionName,
          },
        },
      })

      if (existing) {
        throw new Error("This academic session already exists.")
      }

      const currentSession = await tx.academicSession.findFirst({
        where: {
          schoolId: admin.schoolId,
          isCurrent: true,
        },
      })

      const makeCurrent = !currentSession

      await tx.academicSession.create({
        data: {
          name: sessionName,
          schoolId: admin.schoolId,
          isCurrent: makeCurrent,
          terms: {
            create: [
              {
                name: "First Term",
                order: 1,
                isCurrent: makeCurrent,
                schoolId: admin.schoolId,
              },
              {
                name: "Second Term",
                order: 2,
                isCurrent: false,
                schoolId: admin.schoolId,
              },
              {
                name: "Third Term",
                order: 3,
                isCurrent: false,
                schoolId: admin.schoolId,
              },
            ],
          },
        },
      })
    }, transactionOptions)

    revalidatePath(route)

    return {
      success: true,
      message: "Academic session created successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create academic session.",
    }
  }
}

export async function setCurrentAcademicSession(id: number) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return {
      success: false,
      message: "You are not authorised.",
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.academicSession.findFirst({
        where: {
          id,
          schoolId: admin.schoolId,
        },
      })

      if (!target) {
        throw new Error("Academic session not found.")
      }

      await tx.academicSession.updateMany({
        where: {
          schoolId: admin.schoolId,
        },
        data: {
          isCurrent: false,
        },
      })

      await tx.academicSession.update({
        where: {
          id: target.id,
        },
        data: {
          isCurrent: true,
        },
      })

      const currentTerm = await tx.academicTerm.findFirst({
        where: {
          sessionId: target.id,
          schoolId: admin.schoolId,
          isCurrent: true,
        },
      })

      const firstTerm = currentTerm
        ? currentTerm
        : await tx.academicTerm.findFirst({
            where: {
              sessionId: target.id,
              schoolId: admin.schoolId,
            },
            orderBy: {
              order: "asc",
            },
          })

      if (firstTerm) {
        await tx.academicTerm.updateMany({
          where: {
            sessionId: target.id,
            schoolId: admin.schoolId,
          },
          data: {
            isCurrent: false,
          },
        })

        await tx.academicTerm.update({
          where: {
            id: firstTerm.id,
          },
          data: {
            isCurrent: true,
          },
        })
      }
    }, transactionOptions)

    revalidatePath(route)

    return {
      success: true,
      message: "Current academic session updated.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update current session.",
    }
  }
}

export async function setCurrentAcademicTerm(id: number) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return {
      success: false,
      message: "You are not authorised.",
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.academicTerm.findFirst({
        where: {
          id,
          schoolId: admin.schoolId,
          session: {
            isCurrent: true,
            schoolId: admin.schoolId,
          },
        },
      })

      if (!target) {
        throw new Error(
          "Select a term belonging to the current academic session."
        )
      }

      await tx.academicTerm.updateMany({
        where: {
          sessionId: target.sessionId,
          schoolId: admin.schoolId,
        },
        data: {
          isCurrent: false,
        },
      })

      await tx.academicTerm.update({
        where: {
          id: target.id,
        },
        data: {
          isCurrent: true,
        },
      })
    }, transactionOptions)

    revalidatePath(route)

    return {
      success: true,
      message: "Current academic term updated.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update current term.",
    }
  }
}
