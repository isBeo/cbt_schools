"use client"

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
}

export function RegisterForm({ classes }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterInput>()

  async function onSubmit(data: RegisterInput) {
    await registerStudent({
      ...data,
      classId: Number(data.classId),
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="text-foreground space-y-4 rounded-lg border p-6"
    >
      <Input
        placeholder="First Name"
        {...register("firstName", { required: true })}
      />

      <Input
        placeholder="Last Name"
        {...register("lastName", { required: true })}
      />

      <select
        {...register("classId", { valueAsNumber: true })}
        className="w-full rounded-md border p-2"
      >
        <option value="">Select Class</option>

        {classes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Starting..." : "Start Exam"}
      </Button>
    </form>
  )
}
