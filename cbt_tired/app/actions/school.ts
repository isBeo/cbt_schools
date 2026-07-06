"use server"
import { prisma } from "@/lib/prisma"
import { schoolSchema, type SchoolInput } from "@/lib/validations/school"
import { revalidatePath } from "next/cache"

export async function createSchool(data: SchoolInput) {
  // const data = {
  //   name: formData.get("name"),
  //   address: formData.get("address"),
  // }
  const validated = schoolSchema.safeParse(data)
  
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    }
  }
  try{
    const school = await prisma.school.create({
      data: validated.data,
    })
    revalidatePath("/schools")
    return {
      success: true,
      school,
    }
  }catch(error){
    console.error(error)

    return {
      success: false,
      message: "Unable to create school. Please try again.",
    }
  }

}
