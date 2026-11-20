
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

type CreateTeacherInput = {
  name: string
  email: string
  password: string
}

type ActionResult = {
  success: boolean
  message: string
}

const transactionOptions = {
  maxWait: 10000,
  timeout: 20000,
}

export async function createTeacher(
  input: CreateTeacherInput
): Promise<ActionResult> {
  const session = await auth()

  if (
    !session?.user ||
    session.user.role !== "SCHOOL_ADMIN" ||
    !session.user.schoolId
  ) {
    return {
      success: false,
      message: "You are not authorised to create teacher accounts.",
    }
  }

  const name = input?.name?.trim()
  const email = input?.email?.trim().toLowerCase()
  const password = input?.password

  if (!name || name.length < 2) {
    return { success: false, message: "Enter the teacher's full name." }
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid email address." }
  }

  if (!password || password.length < 8) {
    return {
      success: false,
      message: "Temporary password must be at least 8 characters.",
    }
  }

  const adminId = Number(session.user.id)

  if (!Number.isInteger(adminId) || adminId <= 0) {
    return {
      success: false,
      message: "Unable to verify your account. Please sign in again.",
    }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction(
      async (tx) => {
        const teacher = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: "TEACHER",
            schoolId: session.user.schoolId!,
          },
        })

        await tx.auditLog.create({
          data: {
            userId: adminId,
            schoolId: session.user.schoolId!,
            actorName: session.user.name ?? "School Admin",
            actorRole: session.user.role,
            action: "CREATE",
            entity: "TEACHER",
            entityId: String(teacher.id),
            description: `Created teacher account for ${teacher.name}`,
            metadata: {
              email: teacher.email,
            },
          },
        })
      },
      transactionOptions
    )

    revalidatePath("/dashboard/teachers")
    revalidatePath("/dashboard/teacher-assignments")
    revalidatePath("/dashboard/audit-logs")

    return {
      success: true,
      message: "Teacher account created successfully.",
    }
  } catch (error) {
    console.error("Create teacher error:", error)

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "This email address is already registered.",
      }
    }

    return {
      success: false,
      message: "Unable to create teacher account. Please try again.",
    }
  }
}
