
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  createAcademicSession,
  setCurrentAcademicSession,
  setCurrentAcademicTerm,
} from "../actions"

type AcademicTerm = {
  id: number
  name: string
  order: number
  isCurrent: boolean
}

type AcademicSession = {
  id: number
  name: string
  isCurrent: boolean
  terms: AcademicTerm[]
}

export function AcademicSetupClient({
  sessions,
}: {
  sessions: AcademicSession[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")

  const currentSession = sessions.find((item) => item.isCurrent)

  function handleCreateSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")

    startTransition(async () => {
      const result = await createAcademicSession(name)
      setMessage(result.message)

      if (result.success) {
        setName("")
        router.refresh()
      }
    })
  }

  function handleSetCurrentSession(id: number) {
    setMessage("")

    startTransition(async () => {
      const result = await setCurrentAcademicSession(id)
      setMessage(result.message)

      if (result.success) router.refresh()
    })
  }

  function handleSetCurrentTerm(id: number) {
    setMessage("")

    startTransition(async () => {
      const result = await setCurrentAcademicTerm(id)
      setMessage(result.message)

      if (result.success) router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Create Academic Session</h2>
          <p className="text-sm text-muted-foreground">
            Example: 2026/2027. Three terms will be created automatically.
          </p>
        </div>

        <form onSubmit={handleCreateSession} className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="2026/2027"
            className="h-10 rounded-md border bg-background px-3 text-sm"
            required
          />

          <button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isPending ? "Please wait..." : "Create Session"}
          </button>
        </form>
      </section>

      {message && (
        <p className="rounded-md border p-3 text-sm" role="status">
          {message}
        </p>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Academic Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Select the session your school is currently running.
          </p>
        </div>

        {sessions.length === 0 ? (
          <p className="rounded-xl border p-5 text-sm text-muted-foreground">
            No academic sessions created yet.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-xl border p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{session.name}</h3>
                    {session.isCurrent && (
                      <span className="text-xs font-medium text-green-600">
                        Current Session
                      </span>
                    )}
                  </div>

                  {!session.isCurrent && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSetCurrentSession(session.id)}
                      className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                    >
                      Make Current
                    </button>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {session.terms
                    .sort((a, b) => a.order - b.order)
                    .map((term) => (
                      <div
                        key={term.id}
                        className="rounded-lg bg-muted/50 p-3"
                      >
                        <p className="text-sm font-medium">{term.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {term.isCurrent
                            ? "Current Term"
                            : "Not Current"}
                        </p>

                        {session.isCurrent && !term.isCurrent && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSetCurrentTerm(term.id)}
                            className="mt-2 text-xs font-medium text-primary underline disabled:opacity-50"
                          >
                            Make Current Term
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Current Academic Period</h2>
        {currentSession ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {currentSession.name} —{" "}
            {currentSession.terms.find((term) => term.isCurrent)?.name ??
              "No current term selected"}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No current academic session selected.
          </p>
        )}
      </section>
    </div>
  )
}
