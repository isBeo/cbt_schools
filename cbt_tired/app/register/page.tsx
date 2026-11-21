// 'use client'

import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RegisterForm } from "@/components/forms/StudentRegForm"

export default async function RegisterPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (
    session.user.role !== "SCHOOL_ADMIN" ||
    !session.user.schoolId
  ) {
    redirect("/dashboard")
  }

  const [classes, school] = await Promise.all([
    prisma.class.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.school.findUnique({
      where: {
        id: session.user.schoolId,
      },
      select: {
        code: true,
      },
    }),
  ])

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <div>

        <Link
  href="/dashboard/students"
  className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
>
  ← Back to Students
</Link>
        <h1 className="text-2xl font-bold">
          Student Registration
        </h1>

        <p className="text-sm text-muted-foreground">
          Register a student and create their examination login credentials.
        </p>
      </div>

      {!school?.code ? (
        <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
          Your school code has not been configured yet.
          Contact the system administrator before registering students.
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          No classes have been configured for your school yet.
          Contact the system administrator.
        </div>
      ) : (
        <RegisterForm classes={classes} />
      )}
    </main>
  )
}
