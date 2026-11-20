
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const route = "/dashboard/classes"

const allowedLevels = ["NURSERY", "PRIMARY", "SECONDARY"] as const

async function getSchoolAdmin() {
  const session = await auth()

  if (
    !session?.user ||
    session.user.role !== "SCHOOL_ADMIN" ||
    !session.user.schoolId
  ) {
    return null
  }

  return { schoolId: session.user.schoolId }
}

export async function createClass(data: {
  name: string
  level: string
}) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return { success: false, message: "You are not authorised." }
  }

  const name = data.name.trim()
  const level = data.level.trim().toUpperCase()

  if (name.length < 2) {
    return {
      success: false,
      message: "Class name must contain at least 2 characters.",
    }
  }

  if (!allowedLevels.includes(level as (typeof allowedLevels)[number])) {
    return {
      success: false,
      message: "Select a valid school level.",
    }
  }

  try {
    await prisma.class.create({
      data: {
        name,
        level,
        schoolId: admin.schoolId,
      },
    })

    revalidatePath(route)

    return {
      success: true,
      message: "Class created successfully.",
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A class with this name already exists in your school.",
      }
    }

    console.error("Create class error:", error)

    return {
      success: false,
      message: "Unable to create class. Please try again.",
    }
  }
}

export async function deleteClass(id: number) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return { success: false, message: "You are not authorised." }
  }

  if (!Number.isInteger(id) || id < 1) {
    return { success: false, message: "Invalid class selected." }
  }

  try {
    const existingClass = await prisma.class.findFirst({
      where: {
        id,
        schoolId: admin.schoolId,
      },
    })

    if (!existingClass) {
      return { success: false, message: "Class not found." }
    }

    await prisma.class.delete({
      where: { id: existingClass.id },
    })

    revalidatePath(route)

    return {
      success: true,
      message: "Class deleted successfully.",
    }
  } catch (error) {
    console.error("Delete class error:", error)

    return {
      success: false,
      message:
        "Unable to delete this class. It may already have students or examinations attached to it.",
    }
  }
}
