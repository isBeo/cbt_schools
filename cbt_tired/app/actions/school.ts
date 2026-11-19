"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { Prisma } from "@/lib/generated/prisma/client"

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
      message: "Please correct the highlighted fields.",
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    const school = await prisma.school.create({
      data: validated.data,
    })

    revalidatePath("/schools")

    return {
      success: true,
      message: "School created successfully.",
      school,
    }
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "A school with the same name already exists.",
        }
      }
    }

    console.error(error)

    return {
      success: false,
      message: "Unable to create school. Please try again.",
    }
  }
}
