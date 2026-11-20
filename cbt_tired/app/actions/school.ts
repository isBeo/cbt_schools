
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
