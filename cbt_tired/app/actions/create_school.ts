"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const createSchool = async (a: string, b: string) => {
  const new_sch = await prisma.school.create({
    data: {
      name: a,
      address: b,
    },
  })
  revalidatePath("/school")
  return new_sch
}

export const deleteSchool = async (a: number) => {
  await prisma.school.delete({
    where: {
      id: a,
    },
  })
  console.log("sucessfully deleted")
}
