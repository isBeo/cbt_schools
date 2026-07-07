"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

type RegisterInput = {
  firstName: string
  lastName: string
  classId: number
}

export async function registerStudent(data: RegisterInput) {
  const student = await prisma.student.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      classId: data.classId,
      schoolId: 1, // Temporary: Eagle Crestwood
    },
  })

    //   const student = await prisma.student.create({
    //     data:{
    //         firstName:data.firstName,
    //         lastName:data.lastName,
    //         classId:data.classId,
    //         schoolId:1,
    //     }
    //   })

  redirect(`/exam/${student.id}`)
}
