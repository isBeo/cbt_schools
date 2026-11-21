
"use server"

import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type RegisterInput = {
  firstName: string
  lastName: string
  classId: number
  admissionNo?: string
}

export async function registerStudent(data: RegisterInput) {
  const session = await auth()

  if (
    !session?.user ||
    session.user.role !== "SCHOOL_ADMIN" ||
    !session.user.schoolId
  ) {
    return {
      success: false as const,
      message: "You are not authorized to register students.",
    }
  }

  const firstName = data.firstName.trim()
  const lastName = data.lastName.trim()
  const suppliedAdmissionNo = data.admissionNo?.trim() || null

  if (!firstName || !lastName || !Number.isInteger(data.classId)) {
    return {
      success: false as const,
      message: "Please provide valid student details.",
    }
  }

  const schoolId = session.user.schoolId

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, code: true },
  })

  if (!school?.code?.trim()) {
    return {
      success: false as const,
      message: "Your school code has not been configured. Contact the system administrator.",
    }
  }

  const classRecord = await prisma.class.findFirst({
    where: {
      id: data.classId,
      schoolId,
    },
    select: { id: true, name: true },
  })

  if (!classRecord) {
    return {
      success: false as const,
      message: "The selected class does not belong to your school.",
    }
  }

  const admissionYear = new Date().getFullYear()
  const schoolCode = school.code.trim().toUpperCase()
  const temporaryPassword = randomBytes(9).toString("base64url")
  const passwordHash = await bcrypt.hash(temporaryPassword, 12)
  const fullName = `${firstName} ${lastName}`

  try {
    const student = await prisma.$transaction(async (tx) => {
      let admissionNo = suppliedAdmissionNo

      // Generate an admission number only when the school
      // administrator has not supplied one.
      if (!admissionNo) {
        const sequence = await tx.$queryRaw<{ lastSerial: number }[]>`
          INSERT INTO "AdmissionSequence"
            ("schoolId", "admissionYear", "lastSerial")
          VALUES
            (${schoolId}, ${admissionYear}, 1)
          ON CONFLICT ("schoolId", "admissionYear")
          DO UPDATE SET
            "lastSerial" = "AdmissionSequence"."lastSerial" + 1
          RETURNING "lastSerial"
        `

        const serial = sequence[0]?.lastSerial

        if (!serial) {
          throw new Error("Unable to generate an admission number.")
        }

        admissionNo = `${schoolCode}-${admissionYear}-${String(serial).padStart(4, "0")}`
      }

      // Create the student's login account.
      const user = await tx.user.create({
        data: {
          name: fullName,
          email: null,
          passwordHash,
          role: "STUDENT",
          schoolId,
        },
      })

      // Create the student record.
      const newStudent = await tx.student.create({
        data: {
          firstName,
          lastName,
          admissionNo,
          admissionYear,
          schoolId,
          classId: classRecord.id,
          userId: user.id,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
        },
      })

      // Record the registration in the audit log.
      await tx.auditLog.create({
        data: {
          userId: Number(session.user.id),
          schoolId,
          actorName: session.user.name ?? "School Administrator",
          actorRole: session.user.role,
          action: "CREATE",
          entity: "STUDENT",
          entityId: String(newStudent.id),
          description: `Registered ${fullName} with admission number ${admissionNo} in ${classRecord.name}.`,
          metadata: {
            admissionNo,
            admissionYear,
            classId: classRecord.id,
            className: classRecord.name,
          },
        },
      })

      return newStudent
    })

    return {
      success: true as const,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo!,
      schoolCode,
      temporaryPassword,
    }
  } catch (error) {
    console.error("Student registration failed:", error)

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        message: "This admission number already exists in your school. Please use another one.",
      }
    }

    return {
      success: false as const,
      message: "Student registration failed. Please try again.",
    }
  }
}
