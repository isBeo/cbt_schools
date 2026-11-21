
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { registerStudent } from "@/app/actions/student"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Class = {
  id: number
  name: string
}

type RegisterFormProps = {
  classes: Class[]
}

type RegisterInput = {
  firstName: string
  lastName: string
  classId: number
  admissionNo?: string
}

type Credentials = {
  studentName: string
  admissionNo: string
  schoolCode: string
  temporaryPassword: string
}

export function RegisterForm({ classes }: RegisterFormProps) {
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RegisterInput>()

  async function onSubmit(data: RegisterInput) {
    setError("")
    setCredentials(null)

    const result = await registerStudent({
      ...data,
      classId: Number(data.classId),
    })

    if (!result.success) {
      setError(result.message)
      return
    }

    setCredentials({
      studentName: result.studentName,
      admissionNo: result.admissionNo,
      schoolCode: result.schoolCode,
      temporaryPassword: result.temporaryPassword,
    })

    reset()
  }

  async function copyCredentials() {
    if (!credentials) return

    const text = [
      `Student: ${credentials.studentName}`,
      `School Code: ${credentials.schoolCode}`,
      `Admission Number: ${credentials.admissionNo}`,
      `Temporary Password: ${credentials.temporaryPassword}`,
    ].join("\n")

    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-lg border p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            First Name
          </label>
          <Input
            placeholder="Enter first name"
            {...register("firstName", { required: true })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Last Name
          </label>
          <Input
            placeholder="Enter last name"
            {...register("lastName", { required: true })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Class
          </label>
          <select
            {...register("classId", {
              valueAsNumber: true,
              required: true,
            })}
            defaultValue=""
            className="w-full rounded-md border bg-background p-2 text-sm"
          >
            <option value="" disabled>
              Select class
            </option>

            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Admission Number (Optional)
          </label>
          <Input
            placeholder="Leave blank to generate automatically"
            {...register("admissionNo")}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Enter the school's existing admission number or leave blank
            for ModeCBT to generate one.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering student..." : "Register Student"}
        </Button>
      </form>

      {credentials && (
        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <h2 className="font-semibold text-lg">
              Student Registered Successfully
            </h2>
            <p className="text-sm text-muted-foreground">
              Give these login details to the student. The temporary
              password will not be displayed again after this page is refreshed.
            </p>
          </div>

          <div className="space-y-2 rounded-md bg-muted p-4 text-sm">
            <p>
              <strong>Student:</strong> {credentials.studentName}
            </p>
            <p>
              <strong>School Code:</strong> {credentials.schoolCode}
            </p>
            <p>
              <strong>Admission Number:</strong> {credentials.admissionNo}
            </p>
            <p>
              <strong>Temporary Password:</strong>{" "}
              <span className="font-mono">
                {credentials.temporaryPassword}
              </span>
            </p>
          </div>

          <Button type="button" onClick={copyCredentials}>
            Copy Login Credentials
          </Button>
        </div>
      )}
    </div>
  )
}
