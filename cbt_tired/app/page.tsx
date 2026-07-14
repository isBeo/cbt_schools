import { Input } from "@/components/ui/input"
import React from "react"

const page = async () => {
  // redirect("/dashboard")
  
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-extrabold text-blue-900">
        Eagle Crestwood International School
      </h1>
      <p>
        <i>Welcome to the CBT Center</i>
      </p>

      <form action="" className="mx-auto w-full sm:mx-12 md:w-1/2">
        <Input
          type="text"
          placeholder="Search your name, name + surname e.g John Doe to take your examination"
        />
        <input type="submit" value={"submit"} list="students" />
      </form>
      <select name="" id="students">
        {

        }
      </select>
    </div>
  )
}

export default page
