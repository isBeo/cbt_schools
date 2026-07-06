import { SchoolForm } from "@/components/forms/school_form"

export default function SchoolsPage() {
  return (
    <main className="mx-auto max-w-xl p-6 flex flex-col ">
      <h1 className="mb-6 text-2xl font-bold">Schools</h1>

      <SchoolForm />
    </main>
  )
}
