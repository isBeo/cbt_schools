
type Teacher = {
  id: number
  name: string
  email: string
  createdAt: Date
}

export default function TeachersTable({
  teachers,
}: {
  teachers: Teacher[]
}) {
  if (teachers.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">No teachers registered yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first teacher account using the form above.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted">
          <tr>
            <th className="px-4 py-3">S/N</th>
            <th className="px-4 py-3">Teacher Name</th>
            <th className="px-4 py-3">Email Address</th>
            <th className="px-4 py-3">Date Registered</th>
          </tr>
        </thead>

        <tbody>
          {teachers.map((teacher, index) => (
            <tr key={teacher.id} className="border-b last:border-0">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{teacher.name}</td>
              <td className="px-4 py-3">{teacher.email}</td>
              <td className="px-4 py-3">
                {new Date(teacher.createdAt).toLocaleDateString("en-NG")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
