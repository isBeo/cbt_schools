import { redirect } from "next/navigation"
import React from "react"

const page = async () => {
  redirect("/dashboard")
  // try {
  //   const new_sch = await prisma.school.create({
  //     data: {
  //       name: "ecw",
  //       address: "mercy land",
  //     },
  //   })
  //   console.log(new_sch)
  // } catch (err) {
  //   console.error(err)

  //   if (err instanceof Error) {
  //     console.error(err.message)
  //     console.error(err.stack)
  //   }
  // }

  return <div>{}</div>
}

export default page
