
"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
    <main className="grid min-h-screen bg-background lg:grid-cols-2">

      {/* Left branding panel */}
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:flex">
        <Image
          src="/images/ace-schools-hero.jpg"
          alt="Students learning in a modern classroom"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/75 to-blue-950/60" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight text-white"
          >
            Ace<span className="text-cyan-400">-Schools</span>
          </Link>

          <div className="max-w-lg space-y-6">
            <p className="font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Welcome to Ace-Schools
            </p>

            <h1 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
              Manage your school.
              <br />
              Empower learning.
              <br />
              <span className="text-cyan-400">
                Shape the future.
              </span>
            </h1>

            <p className="max-w-md text-lg leading-8 text-slate-200">
              Your school management and examination platform,
              bringing students, teachers and administrators together.
            </p>
          </div>

          <p className="text-sm text-slate-300">
            A smarter approach to school management.
          </p>
        </div>
      </section>

      {/* Login panel */}
      <section className="flex min-h-screen items-center justify-center bg-background px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">

          {/* Mobile branding */}
          <div className="mb-10 text-center lg:hidden">
            <Link
              href="/"
              className="text-3xl font-extrabold tracking-tight text-foreground"
            >
              Ace<span className="text-cyan-500">-Schools</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-xl shadow-black/5 sm:p-9">
            <div className="mb-8 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Account Access
              </p>

              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Welcome back
              </h2>

              <p className="text-sm leading-6 text-muted-foreground">
                Sign in to continue to your Ace-Schools account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Staff email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground"
                >
                  Staff Email
                </label>

                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />

                <p className="text-xs text-muted-foreground">
                  Staff members should enter their registered email address.
                </p>
              </div>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-border" />
                <span className="mx-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Student login
                </span>
                <div className="flex-grow border-t border-border" />
              </div>

              {/* Student school code */}
              <div className="space-y-2">
                <label
                  htmlFor="schoolCode"
                  className="text-sm font-semibold text-foreground"
                >
                  School Code
                </label>

                <Input
                  id="schoolCode"
                  placeholder="Enter school code"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Student admission number */}
              <div className="space-y-2">
                <label
                  htmlFor="admissionNo"
                  className="text-sm font-semibold text-foreground"
                >
                  Admission Number
                </label>

                <Input
                  id="admissionNo"
                  placeholder="Enter admission number"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground"
                >
                  Password
                </label>

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-12 w-full bg-cyan-600 font-semibold text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In to Ace-Schools"}
              </Button>
            </form>

            <div className="mt-7 border-t border-border pt-6 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                ← Back to homepage
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ace-Schools · School Management and Examination Platform
          </p>
        </div>
      </section>
    </main>
  )
}
