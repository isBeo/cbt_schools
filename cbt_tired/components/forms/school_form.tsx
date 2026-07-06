"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { schoolSchema, type SchoolInput } from "@/lib/validations/school"

export function SchoolForm() {
  const form = useForm<SchoolInput>({
    // resolver: zodResolver(schoolSchema),

    defaultValues: {
      name: "",
      address: "",
    },
  })
  const onSubmit = (data: SchoolInput) => {
    console.log(data)
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 p-4 shadow shadow-primary rounded-md">
      <h3 className="bg-accent p-3 text-center">Registration</h3>
      <Input placeholder="School name" {...form.register("name")} />

      <Input placeholder="School address" {...form.register("address")} />

      <Button type="submit">Save School</Button>
    </form>
  )
}
