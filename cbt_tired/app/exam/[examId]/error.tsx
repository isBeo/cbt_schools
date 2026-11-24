"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { hasAvailableExams } from "@/app/actions/exam"

export default function ExamError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const started = useRef(false)
  const [message, setMessage] = useState("Checking your examination status...")

  useEffect(() => {
    if (started.current) return

    started.current = true

    async function handleExamError() {
      try {
        const available = await hasAvailableExams()

        if (available) {
          router.replace("/student/exams")
          return
        }

        setMessage("You have no remaining examinations. Logging you out...")

        await signOut({ redirectTo: "/login" })
      } catch {
        setMessage(
          "We could not check your examination status. Please try again."
        )
        started.current = false
      }
    }

    void handleExamError()
  }, [router])

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Examination Unavailable</h1>

      <p className="max-w-md text-muted-foreground">{message}</p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => router.replace("/student/exams")}>
          Available Exams
        </Button>

        <Button
          variant="outline"
          onClick={() => signOut({ redirectTo: "/login" })}
        >
          Logout
        </Button>
      </div>
    </main>
  )
}
