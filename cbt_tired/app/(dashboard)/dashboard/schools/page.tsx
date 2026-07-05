import { prisma } from "@/lib/prisma"
import { SchoolTable } from "./components/SchoolTable"

const page = async () => {
  // const schools = await prisma.school.findMany({
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  // })

  // console.table(schools)
  return <section>schools</section>
}
export default page
