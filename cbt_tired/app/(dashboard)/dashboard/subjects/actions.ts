
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const route = "/dashboard/subjects"

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

export async function createSubject(data: {
  name: string
  code: string
}) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return { success: false, message: "You are not authorised." }
  }

  const name = data.name.trim()
  const code = data.code.trim().toUpperCase()

  if (name.length < 2) {
    return {
      success: false,
      message: "Subject name must contain at least 2 characters.",
    }
  }

  if (!/^[A-Z0-9-]{2,15}$/.test(code)) {
    return {
      success: false,
      message: "Subject code must be 2–15 characters (letters, numbers or hyphens).",
    }
  }

  try {
    await prisma.subject.create({
      data: {
        name,
        code,
        schoolId: admin.schoolId,
      },
    })

    revalidatePath(route)

    return {
      success: true,
      message: "Subject created successfully.",
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
        message: "This subject name or code already exists in your school.",
      }
    }

    console.error("Create subject error:", error)

    return {
      success: false,
      message: "Unable to create subject. Please try again.",
    }
  }
}

export async function deleteSubject(id: number) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return { success: false, message: "You are not authorised." }
  }

  if (!Number.isInteger(id) || id < 1) {
    return { success: false, message: "Invalid subject selected." }
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id,
        schoolId: admin.schoolId,
      },
    })

    if (!subject) {
      return { success: false, message: "Subject not found." }
    }

    await prisma.subject.delete({
      where: { id: subject.id },
    })

    revalidatePath(route)

    return {
      success: true,
      message: "Subject deleted successfully.",
    }
  } catch (error) {
    console.error("Delete subject error:", error)

    return {
      success: false,
      message:
        "Unable to delete this subject. It may already be linked to examinations or teacher assignments.",
    }
  }
}
