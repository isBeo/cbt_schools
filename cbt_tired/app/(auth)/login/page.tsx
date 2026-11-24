"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [schoolCode, setSchoolCode] = useState("")
  const [admissionNo, setAdmissionNo] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        ...(email.trim() ? { email } : { schoolCode, admissionNo }),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid login details.")
        return
      }

      const session = await getSession()

      if (session?.user?.role === "STUDENT") {
        router.push("/student/exams")
      } else {
        router.push("/dashboard")
      }

      router.refresh()
    } catch {
      setError("Unable to log in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">ModeCBT Login</h1>
          <p className="text-sm text-muted-foreground">
            Staff: use email. Students: use school code and admission number.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Staff Email (leave blank for students)
            </label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">School Code</label>
            <Input
              placeholder="ECWIS"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admission Number</label>
            <Input
              placeholder="Student admission number"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  )
}
