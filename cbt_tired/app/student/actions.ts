"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function loginStudent(formData: FormData) {
  const admissionNo = formData.get("admissionNo") as string

  const student = await prisma.student.findUnique({
    where: {
      admissionNo,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  redirect(`/student/${student.id}/exams`)
}
