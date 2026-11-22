"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createSubject } from "../actions"

export function CreateSubject() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    startTransition(async () => {
      const result = await createSubject({ name, code })

      setMessage(result.message)
      setIsError(!result.success)

      if (result.success) {
        setName("")
        setCode("")
        router.refresh()
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border bg-card p-5"
    >
      <div>
        <h2 className="text-lg font-semibold">Create Subject</h2>
        <p className="text-sm text-muted-foreground">
          Add a subject to your school's subject list.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="subject-name" className="text-sm font-medium">
            Subject name
          </label>
          <input
            id="subject-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mathematics"
            required
            minLength={2}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="subject-code" className="text-sm font-medium">
            Subject code
          </label>
          <input
            id="subject-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="e.g. MTH"
            required
            minLength={2}
            maxLength={15}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={`text-sm ${
            isError ? "text-destructive" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Subject"}
      </button>
    </form>
  )
}
