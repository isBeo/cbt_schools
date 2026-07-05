// import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

// export const  createSchool(){}

// export const  getSchools(){}

// export const  updateSchool(){}

// export const  deleteSchool(){}
export const del = async (a: number) => {
  prisma.school.delete({
    where: {
      id: a,
    },
  })
}
