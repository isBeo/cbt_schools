
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClass } from "../action"

export function CreateClass() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [level, setLevel] = useState("")

  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    startTransition(async () => {
      const result = await createClass({ name, level })

      setMessage(result.message)
      setIsError(!result.success)

      if (result.success) {
        setName("")
        setLevel("")
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
        <h2 className="text-lg font-semibold">Create Class</h2>
        <p className="text-sm text-muted-foreground">
          Add a class to your school's academic structure.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="class-name" className="text-sm font-medium">
            Class name
          </label>
          <input
            id="class-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Primary 1 or JSS 1"
            required
            minLength={2}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="class-level" className="text-sm font-medium">
            School level
          </label>
          <select
            id="class-level"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            required
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select level</option>
            <option value="NURSERY">Nursery</option>
            <option value="PRIMARY">Primary</option>
            <option value="SECONDARY">Secondary</option>
          </select>
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
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Class"}
      </button>
    </form>
  )
}
