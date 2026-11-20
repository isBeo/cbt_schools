
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createTeacher } from "../actions"

export default function CreateTeacher() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")

    startTransition(async () => {
      const result = await createTeacher({ name, email, password })

      setMessage(result.message)
      setIsError(!result.success)

      if (result.success) {
        setName("")
        setEmail("")
        setPassword("")
        router.refresh()
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border p-5"
    >
      <div>
        <h2 className="text-lg font-semibold">Register a Teacher</h2>
        <p className="text-sm text-muted-foreground">
          Create a login account for a teacher in your school.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="teacher-name" className="text-sm font-medium">
          Full Name
        </label>
        <input
          id="teacher-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter teacher's full name"
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="teacher-email" className="text-sm font-medium">
          Email Address
        </label>
        <input
          id="teacher-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teacher@example.com"
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="teacher-password" className="text-sm font-medium">
          Temporary Password
        </label>
        <input
          id="teacher-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {message && (
        <p className={isError ? "text-sm text-red-600" : "text-sm text-green-600"}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Teacher Account"}
      </button>
    </form>
  )
}

