
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const route = "/dashboard/teacher-assignments"

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
    schoolId: session.user.schoolId,
    userId: session.user.id,
  }
}

export async function createTeacherAssignment(data: {
  teacherId: number
  classId: number
  subjectId: number
}) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return { success: false, message: "You are not authorised." }
  }

  const { teacherId, classId, subjectId } = data

  if (
    !Number.isInteger(teacherId) ||
    !Number.isInteger(classId) ||
    !Number.isInteger(subjectId) ||
    teacherId < 1 ||
    classId < 1 ||
    subjectId < 1
  ) {
    return {
      success: false,
      message: "Please select a valid teacher, class and subject.",
    }
  }

  try {
    const [teacher, schoolClass, subject] = await Promise.all([
      prisma.user.findFirst({
        where: {
          id: teacherId,
          role: "TEACHER",
          schoolId: admin.schoolId,
        },
      }),

      prisma.class.findFirst({
        where: {
          id: classId,
          schoolId: admin.schoolId,
        },
      }),

      prisma.subject.findFirst({
        where: {
          id: subjectId,
          schoolId: admin.schoolId,
        },
      }),
    ])

    if (!teacher) {
      return {
        success: false,
        message: "Teacher not found in your school.",
      }
    }

    if (!schoolClass) {
      return {
        success: false,
        message: "Class not found in your school.",
      }
    }

    if (!subject) {
      return {
        success: false,
        message: "Subject not found in your school.",
      }
    }

    await prisma.teacherAssignment.create({
      data: {
        teacherId,
        classId,
        subjectId,
      },
    })

    revalidatePath(route)

    return {
      success: true,
      message: "Teacher assigned successfully.",
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
        message: "This teacher is already assigned to this subject and class.",
      }
    }

    console.error("Create teacher assignment error:", error)

    return {
      success: false,
      message: "Unable to create assignment. Please try again.",
    }
  }
}

export async function deleteTeacherAssignment(id: number) {
  const admin = await getSchoolAdmin()

  if (!admin) {
    return { success: false, message: "You are not authorised." }
  }

  if (!Number.isInteger(id) || id < 1) {
    return { success: false, message: "Invalid assignment selected." }
  }

  try {
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        id,
        teacher: {
          schoolId: admin.schoolId,
        },
        class: {
          schoolId: admin.schoolId,
        },
        subject: {
          schoolId: admin.schoolId,
        },
      },
    })

    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found.",
      }
    }

    await prisma.teacherAssignment.delete({
      where: {
        id: assignment.id,
      },
    })

    revalidatePath(route)

    return {
      success: true,
      message: "Teacher assignment removed successfully.",
    }
  } catch (error) {
    console.error("Delete teacher assignment error:", error)

    return {
      success: false,
      message: "Unable to remove this assignment.",
    }
  }
}
