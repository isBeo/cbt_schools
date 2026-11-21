
"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { Prisma } from "@/lib/generated/prisma/client"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { schoolSchema, type SchoolInput } from "@/lib/validations/school"

export async function createSchool(data: SchoolInput) {
  const session = await auth()

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      message: "You are not authorized to create a school.",
    }
  }

  const validated = schoolSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the submitted fields.",
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const {
    name,
    code,
    address,
    adminName,
    adminEmail,
    adminPassword,
  } = validated.data

  try {
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    await prisma.$transaction(
      async (tx) => {
        const school = await tx.school.create({
          data: {
            name,
            code,
            address,
          },
        })

        await tx.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: "SCHOOL_ADMIN",
            schoolId: school.id,
          },
        })
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    )

    revalidatePath("/dashboard/schools")
    revalidatePath("/dashboard/academic-setup")

    return {
      success: true,
      message: "School and its administrator were created successfully.",
    }
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target
        const targetText = Array.isArray(target)
          ? target.join(" ")
          : String(target ?? "")

        if (targetText.toLowerCase().includes("email")) {
          return {
            success: false,
            message: "This administrator email is already registered.",
          }
        }

        if (targetText.toLowerCase().includes("code")) {
          return {
            success: false,
            message: "This school code is already in use.",
          }
        }

        if (targetText.toLowerCase().includes("name")) {
          return {
            success: false,
            message: "A school with the same name already exists.",
          }
        }

        return {
          success: false,
          message: "A record with these details already exists.",
        }
      }
    }

    console.error("School registration error:", error)

    return {
      success: false,
      message: "Unable to register school. Please try again.",
    }
  }
}




export async function updateSchoolCode(schoolId: number, code: string) {
  const session = await auth()

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      message: "You are not authorized to update school details.",
    }
  }

  const normalizedCode = code.trim().toUpperCase()

  if (!/^[A-Z0-9]{2,10}$/.test(normalizedCode)) {
    return {
      success: false,
      message: "School code must contain 2–10 letters or numbers.",
    }
  }

  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, code: true },
    })

    if (!school) {
      return { success: false, message: "School not found." }
    }

    // Once an existing code has been used for admission numbers,
    // it cannot be changed.
    if (school.code && school.code !== normalizedCode) {
      const [studentCount, sequenceCount] = await Promise.all([
        prisma.student.count({
          where: {
            schoolId,
            admissionNo: { not: null },
          },
        }),
        prisma.admissionSequence.count({
          where: { schoolId },
        }),
      ])

      if (studentCount > 0 || sequenceCount > 0) {
        return {
          success: false,
          message:
            "This school code cannot be changed because admission numbers have already been issued.",
        }
      }
    }

    await prisma.school.update({
      where: { id: schoolId },
      data: { code: normalizedCode },
    })

    revalidatePath("/dashboard/schools")
    revalidatePath(`/dashboard/schools/${schoolId}/edit`)

    return {
      success: true,
      message: "School code updated successfully.",
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "This school code is already assigned to another school.",
      }
    }

    console.error("School code update error:", error)

    return {
      success: false,
      message: "Unable to update school code.",
    }
  }
}
