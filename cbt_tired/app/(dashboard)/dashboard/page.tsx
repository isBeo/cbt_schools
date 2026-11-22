import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StatCard } from "./components/StatCard"
import {
  ExamActivityChart,
  type ExamActivityPoint,
} from "./components/ExamActivityChart"

import {
  School,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  BarChart3,
  UserCheck,
  BookCheck,
} from "lucide-react"

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const { role, schoolId, name } = session.user

  if (!Number.isInteger(userId) || !role) {
    redirect("/login")
  }

  const firstName = name?.trim().split(/\s+/)[0]

  // Prepare the last seven calendar days
  const today = new Date()
  const sevenDaysAgo = new Date(today)

  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  // Prepare empty chart data
  const examActivity: ExamActivityPoint[] = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(sevenDaysAgo)
      date.setDate(sevenDaysAgo.getDate() + index)

      return {
        date: date.toLocaleDateString("en-NG", {
          weekday: "short",
        }),
        attempts: 0,
      }
    }
  )

  // Date filter for exam activity
  const activityWhere = {
    startedAt: {
      gte: sevenDaysAgo,
      lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    },
  }

  // Fetch exam activity according to role
  let activityAttempts: { startedAt: Date }[] = []

  if (role === "SUPER_ADMIN") {
    activityAttempts = await prisma.examAttempt.findMany({
      where: activityWhere,
      select: { startedAt: true },
    })
  } else if (role === "SCHOOL_ADMIN" && schoolId !== null) {
    activityAttempts = await prisma.examAttempt.findMany({
      where: {
        ...activityWhere,
        student: { schoolId },
      },
      select: { startedAt: true },
    })
  }

  // Populate the chart with actual exam attempts
  for (const attempt of activityAttempts) {
    const attemptDate = new Date(attempt.startedAt)
    attemptDate.setHours(0, 0, 0, 0)

    const dayIndex = Math.round(
      (attemptDate.getTime() - sevenDaysAgo.getTime()) / (24 * 60 * 60 * 1000)
    )

    if (dayIndex >= 0 && dayIndex < examActivity.length) {
      examActivity[dayIndex].attempts += 1
    }
  }

  let heading = "Dashboard"
  let description = "Your school management overview."

  let stats: {
    title: string
    value: number
    icon: typeof School
    description?: string
  }[] = []

  // SUPER ADMIN: Platform-wide statistics
  if (role === "SUPER_ADMIN") {
    heading = "Platform Overview"
    description = "An overview of all schools on Ace-Schools."

    const [schools, students, classes, subjects, exams, attempts] =
      await Promise.all([
        prisma.school.count(),
        prisma.student.count(),
        prisma.class.count(),
        prisma.subject.count(),
        prisma.exam.count(),
        prisma.examAttempt.count(),
      ])

    stats = [
      { title: "Schools", value: schools, icon: School },
      { title: "Students", value: students, icon: Users },
      { title: "Classes", value: classes, icon: GraduationCap },
      { title: "Subjects", value: subjects, icon: BookOpen },
      { title: "Exams", value: exams, icon: ClipboardList },
      { title: "Exam Attempts", value: attempts, icon: BarChart3 },
    ]
  }

  // SCHOOL ADMIN: Statistics belonging to their school
  else if (role === "SCHOOL_ADMIN") {
    heading = "School Overview"
    description = "An overview of your school's academic activities."

    if (schoolId !== null) {
      const [students, teachers, classes, subjects, exams, attempts] =
        await Promise.all([
          prisma.student.count({ where: { schoolId } }),
          prisma.user.count({
            where: { schoolId, role: "TEACHER" },
          }),
          prisma.class.count({ where: { schoolId } }),
          prisma.subject.count({ where: { schoolId } }),
          prisma.exam.count({
            where: { class: { schoolId } },
          }),
          prisma.examAttempt.count({
            where: { student: { schoolId } },
          }),
        ])

      stats = [
        { title: "Students", value: students, icon: Users },
        { title: "Teachers", value: teachers, icon: UserCheck },
        { title: "Classes", value: classes, icon: GraduationCap },
        { title: "Subjects", value: subjects, icon: BookOpen },
        { title: "Exams", value: exams, icon: ClipboardList },
        { title: "Exam Attempts", value: attempts, icon: BarChart3 },
      ]
    }
  }

  // TEACHER: Only assigned academic activities
  else if (role === "TEACHER") {
    heading = "Teaching Overview"
    description = "An overview of your assigned classes and subjects."

    const assignments = await prisma.teacherAssignment.findMany({
      where: { teacherId: userId },
      select: { classId: true, subjectId: true },
    })

    const [classes, subjects, exams] = await Promise.all([
      prisma.class.count({
        where: {
          teacherAssignments: {
            some: { teacherId: userId },
          },
        },
      }),
      prisma.subject.count({
        where: {
          teacherAssignments: {
            some: { teacherId: userId },
          },
        },
      }),
      assignments.length
        ? prisma.exam.count({
            where: {
              OR: assignments.map(({ classId, subjectId }) => ({
                classId,
                subjectId,
              })),
            },
          })
        : Promise.resolve(0),
    ])

    stats = [
      {
        title: "Assigned Classes",
        value: classes,
        icon: GraduationCap,
      },
      {
        title: "Assigned Subjects",
        value: subjects,
        icon: BookOpen,
      },
      {
        title: "Assigned Lessons/Exams",
        value: exams,
        icon: ClipboardList,
      },
      {
        title: "Teaching Assignments",
        value: assignments.length,
        icon: UserCheck,
      },
    ]
  }

  // STUDENT: Logged-in student's academic information
  else if (role === "STUDENT") {
    heading = "My Learning Overview"
    description = "Your examinations and academic progress."

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, classId: true },
    })

    if (student) {
      const [availableExams, attempts, results] = await Promise.all([
        prisma.exam.count({
          where: {
            classId: student.classId,
            status: { in: ["PUBLISHED", "ACTIVE"] },
          },
        }),
        prisma.examAttempt.count({
          where: { studentId: student.id },
        }),
        prisma.result.count({
          where: { attempt: { studentId: student.id } },
        }),
      ])

      stats = [
        {
          title: "Available Exams",
          value: availableExams,
          icon: ClipboardList,
        },
        {
          title: "My Attempts",
          value: attempts,
          icon: BookCheck,
        },
        {
          title: "Results",
          value: results,
          icon: BarChart3,
        },
      ]
    }
  }

  // PARENT: Information about linked children
  else if (role === "PARENT") {
    heading = "Parent Overview"
    description = "An overview of your children's academic activities."

    const children = await prisma.parentStudent.findMany({
      where: { parentId: userId },
      select: { studentId: true },
    })

    const childIds = children.map((child) => child.studentId)

    const [attempts, results] = await Promise.all([
      prisma.examAttempt.count({
        where: { studentId: { in: childIds } },
      }),
      prisma.result.count({
        where: {
          attempt: { studentId: { in: childIds } },
        },
      }),
    ])

    stats = [
      {
        title: "Linked Children",
        value: childIds.length,
        icon: Users,
      },
      {
        title: "Exam Attempts",
        value: attempts,
        icon: ClipboardList,
      },
      {
        title: "Results",
        value: results,
        icon: BarChart3,
      },
    ]
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>

        <p className="text-muted-foreground">
          {firstName ? `Welcome back, ${firstName}. ` : ""}
          {description}
        </p>
      </div>

      {/* Statistics */}
      {stats.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No dashboard information is available yet. Please contact your school
          administrator if you think this is an error.
        </p>
      )}

      {/* Exam Activity Chart */}
      {(role === "SUPER_ADMIN" || role === "SCHOOL_ADMIN") && (
        <ExamActivityChart data={examActivity} />
      )}
    </div>
  )
}
