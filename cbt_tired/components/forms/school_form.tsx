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

  return (
    <form>
      <Input placeholder="School name" {...form.register("name")} />

      <Button type="submit">Save School</Button>
    </form>
  )
}
