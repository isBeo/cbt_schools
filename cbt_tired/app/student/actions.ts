"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function loginStudent(formData: FormData) {
  const admissionNo = formData.get("admissionNo") as string

 const student = await prisma.student.findFirst({
  where: {
    admissionNo,
  },
})

  if (!student) {
    throw new Error("Student not found")
  }

  redirect(`/student/${student.id}/exams`)
}

export async function allStudent() {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  })
  return students
}
