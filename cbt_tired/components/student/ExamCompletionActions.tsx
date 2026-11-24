"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { LoaderCircle, BookOpen, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ExamCompletionActions() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        disabled={checking || loggingOut}
        onClick={() => {
          setChecking(true)
          router.push("/student/exams")
        }}
      >
        {checking ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <BookOpen className="mr-2 h-4 w-4" />
        )}
        {checking ? "Loading exams..." : "Check Available Exams"}
      </Button>

      <Button
        variant="outline"
        disabled={loggingOut || checking}
        onClick={async () => {
          setLoggingOut(true)
          await signOut({ redirectTo: "/login" })
        }}
      >
        {loggingOut ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        {loggingOut ? "Logging out..." : "Log Out"}
      </Button>
    </div>
  )
}
