"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteClass } from "../action"

type SchoolClass = {
  id: number
  name: string
  level: string
  createdAt: Date
}

type ClassTableProps = {
  classes: SchoolClass[]
}

export function ClassTable({ classes }: ClassTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: number, name: string) {
    const confirmed = window.confirm(`Are you sure you want to delete ${name}?`)

    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteClass(id)

      if (!result.success) {
        window.alert(result.message)
        return
      }

      window.alert(result.message)
      router.refresh()
    })
  }

  if (classes.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="font-medium">No classes created yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the form above to create your first class.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 font-medium">S/N</th>
            <th className="px-4 py-3 font-medium">Class name</th>
            <th className="px-4 py-3 font-medium">School level</th>
            <th className="px-4 py-3 font-medium">Date created</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>

        <tbody>
          {classes.map((schoolClass, index) => (
            <tr key={schoolClass.id} className="border-t">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{schoolClass.name}</td>
              <td className="px-4 py-3">
                {schoolClass.level.charAt(0) +
                  schoolClass.level.slice(1).toLowerCase()}
              </td>
              <td className="px-4 py-3">
                {new Date(schoolClass.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(schoolClass.id, schoolClass.name)}
                  className="hover:text-destructive-foreground rounded-md border border-destructive px-3 py-1.5 text-destructive hover:bg-destructive disabled:opacity-50"
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
