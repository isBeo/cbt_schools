
"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteSubject } from "../actions"

type Subject = {
  id: number
  name: string
  code: string
  createdAt: Date
}

export function SubjectsTable({ subjects }: { subjects: Subject[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: number, name: string) {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteSubject(id)

      window.alert(result.message)

      if (result.success) {
        router.refresh()
      }
    })
  }

  if (subjects.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="font-medium">No subjects created yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the form above to create your first subject.
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
            <th className="px-4 py-3">Subject name</th>
            <th className="px-4 py-3">Subject code</th>
            <th className="px-4 py-3">Date created</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {subjects.map((subject, index) => (
            <tr key={subject.id} className="border-t">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{subject.name}</td>
              <td className="px-4 py-3">{subject.code}</td>
              <td className="px-4 py-3">
                {new Date(subject.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(subject.id, subject.name)}
                  className="rounded-md border border-destructive px-3 py-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
