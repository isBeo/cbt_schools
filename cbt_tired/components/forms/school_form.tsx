
"use client"

import { createSchool } from "@/app/actions/school"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type SchoolInput } from "@/lib/validations/school"

export function SchoolForm() {
  const form = useForm<SchoolInput>({
    defaultValues: {
      name: "",
      address: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
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
      className="flex flex-col gap-6 rounded-md p-4 shadow shadow-primary"
    >
      <div className="space-y-4">
        <h3 className="bg-accent p-3 text-center font-semibold">
          School Details
        </h3>

        <Input
          placeholder="School name"
          {...form.register("name")}
        />

        <Input
          placeholder="School address"
          {...form.register("address")}
        />
      </div>

      <div className="space-y-4">
        <h3 className="bg-accent p-3 text-center font-semibold">
          First School Administrator
        </h3>

        <Input
          placeholder="Administrator's full name"
          {...form.register("adminName")}
        />

        <Input
          type="email"
          placeholder="Administrator's email address"
          {...form.register("adminEmail")}
        />

        <Input
          type="password"
          placeholder="Temporary password (minimum 8 characters)"
          {...form.register("adminPassword")}
        />

        <p className="text-xs text-muted-foreground">
          The administrator will use this email and temporary password to log
          into the school management system.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register School"}
      </Button>
    </form>
  )
}
