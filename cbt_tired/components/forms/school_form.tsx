"use client"

import { createSchool } from "@/app/actions/school"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { type SchoolInput } from "@/lib/validations/school"

export function SchoolForm() {
  const form = useForm<SchoolInput>({
    // We'll re-enable this once we resolve the zodResolver issue.
    // resolver: zodResolver(schoolSchema),

    defaultValues: {
      name: "",
      address: "",
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: SchoolInput) => {
    const result = await createSchool(data)

    if (result.success) {
      toast.success(result.message)

      form.reset()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-8 rounded-md p-4 shadow shadow-primary"
    >
      <h3 className="bg-accent p-3 text-center">Registration</h3>

      <Input placeholder="School name" {...form.register("name")} />

      <Input placeholder="School address" {...form.register("address")} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save School"}
      </Button>
    </form>
  )
}
