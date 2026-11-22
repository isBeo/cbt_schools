"use client"

import { useEffect, useState } from "react"
import { createSchool } from "@/app/actions/school"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type SchoolInput } from "@/lib/validations/school"

function suggestSchoolCode(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => !["the", "of", "and", "for"].includes(word.toLowerCase()))

  const acronym = words
    .map((word) => word.replace(/[^a-z0-9]/gi, "")[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 10)

  if (acronym.length >= 2) return acronym

  return name
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 10)
}

export function SchoolForm() {
  const [codeEdited, setCodeEdited] = useState(false)

  const form = useForm<SchoolInput>({
    defaultValues: {
      name: "",
      code: "",
      address: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
    setValue,
  } = form

  const schoolName = form.watch("name")

  useEffect(() => {
    if (!codeEdited) {
      setValue("code", suggestSchoolCode(schoolName), {
        shouldValidate: true,
      })
    }
  }, [schoolName, codeEdited, setValue])

  const onSubmit = async (data: SchoolInput) => {
    console.log("Submitted school data:", data)

    const result = await createSchool(data)

    if (result.success) {
      toast.success(result.message)
      form.reset()
      setCodeEdited(false)
    } else {
      if ("errors" in result && result.errors) {
        console.error("Validation errors:", result.errors)

        const firstError = Object.entries(result.errors).flatMap(
          ([field, messages]) =>
            (messages ?? []).map((message) => `${field}: ${message}`)
        )[0]

        toast.error(firstError ?? result.message)
      } else {
        toast.error(result.message)
      }
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

        <div>
          <Input placeholder="School name" {...form.register("name")} />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Input
            placeholder="School code (e.g. ECIS)"
            autoComplete="off"
            {...form.register("code", {
              onChange: () => setCodeEdited(true),
            })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Suggested automatically from the school name. You can edit it before
            registering the school.
          </p>
          {errors.code && (
            <p className="mt-1 text-sm text-destructive">
              {errors.code.message}
            </p>
          )}
        </div>

        <Input placeholder="School address" {...form.register("address")} />
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
