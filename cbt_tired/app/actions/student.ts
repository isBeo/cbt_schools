"use server"

import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"

type RegisterInput = {
  firstName: string
  lastName: string
  classId: number
}

export async function registerStudent(data: RegisterInput) {
  // Find the configured school
  const school = await prisma.school.findFirst()

  if (!school) {
    throw new Error("No school has been configured.")
  }

  // Create student
  const student = await prisma.student.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      classId: data.classId,
      schoolId: school.id,
    },
  })

  // Find the active exam for this class
 const exam = await prisma.exam.findFirst({
   where: {
     classId: data.classId,
   },
 })

  if (!exam) {
    throw new Error("No active exam found for this class.")
  }

  redirect(`/exam/${exam.id}?student=${student.id}`)
}
