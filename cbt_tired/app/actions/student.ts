"use server"

import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"

type RegisterInput = {
  firstName: string
  lastName: string
  classId: number
}

export async function registerStudent(data: RegisterInput) {
  const school = await prisma.school.findFirst()

  if (!school) {
    throw new Error("No school has been configured.")
  }

  const student = await prisma.student.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      classId: data.classId,
      schoolId: school.id,
    },
  })

  redirect(`/student/${student.id}`)
}
