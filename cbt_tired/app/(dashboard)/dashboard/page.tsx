import { prisma } from "@/lib/prisma"
import { StatCard } from "./components/StatCard"

import {
  School,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  BarChart3,
} from "lucide-react"

export default async function Dashboard() {
  const [schools, students, classes, subjects, exams, attempts] =
    await Promise.all([
      prisma.school.count(),
      prisma.student.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.exam.count(),
      prisma.examAttempt.count(),
    ])

  return (
    <div className="flex flex-col gap-12 p-8">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <p className="text-muted-foreground">
          Welcome, here&apos;s what&apos;s happening in your CBT system
          today.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Schools"
          value={schools}
          icon={School}
          description="Registered schools"
        />

        <StatCard
          title="Students"
          value={students}
          icon={Users}
          description="Total students"
        />

        <StatCard
          title="Classes"
          value={classes}
          icon={GraduationCap}
          description="Available classes"
        />

        <StatCard
          title="Subjects"
          value={subjects}
          icon={BookOpen}
          description="Subjects offered"
        />

        <StatCard
          title="Exams"
          value={exams}
          icon={ClipboardList}
          description="Created exams"
        />

        <StatCard
          title="Attempts"
          value={attempts}
          icon={BarChart3}
          description="Exam attempts"
        />
      </div>
    </div>
  )
}
