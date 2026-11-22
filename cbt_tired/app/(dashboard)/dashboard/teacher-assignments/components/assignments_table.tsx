"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteTeacherAssignment } from "../actions"

type Assignment = {
  id: number
  createdAt: Date
  teacher: {
    name: string
    email: string | null
  }
  class: {
    name: string
  }
  subject: {
    name: string
    code: string
  }
}

export function AssignmentsTable({
  assignments,
}: {
  assignments: Assignment[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: number, teacherName: string) {
    if (!window.confirm(`Remove ${teacherName}'s teaching assignment?`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteTeacherAssignment(id)

      window.alert(result.message)

      if (result.success) {
        router.refresh()
      }
    })
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="font-medium">No teacher assignments yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the form above to assign a teacher to a class and subject.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3">S/N</th>
            <th className="px-4 py-3">Teacher</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Date assigned</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {assignments.map((assignment, index) => (
            <tr key={assignment.id} className="border-t">
              <td className="px-4 py-3">{index + 1}</td>

              <td className="px-4 py-3">
                <p className="font-medium">{assignment.teacher.name}</p>
                <p className="text-xs text-muted-foreground">
                  {assignment.teacher.email}
                </p>
              </td>

              <td className="px-4 py-3">{assignment.class.name}</td>

              <td className="px-4 py-3">
                {assignment.subject.name} ({assignment.subject.code})
              </td>

              <td className="px-4 py-3">
                {new Date(assignment.createdAt).toLocaleDateString()}
              </td>

              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    handleDelete(assignment.id, assignment.teacher.name)
                  }
                  className="hover:text-destructive-foreground rounded-md border border-destructive px-3 py-1.5 text-destructive hover:bg-destructive disabled:opacity-50"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
