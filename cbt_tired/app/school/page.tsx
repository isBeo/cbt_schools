import { prisma } from "@/lib/prisma"

const page = async () => {
  try {
    const newSch = await prisma.school.create({
      data: {
        name: "eagle crestwood",
        address: "mercy land",
      },
    })

    console.log(newSch)
  } catch (e) {
    console.error(e)
    throw e
  }
  return <div>{}</div>
}

export default page
