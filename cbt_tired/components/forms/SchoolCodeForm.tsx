
"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { updateSchoolCode } from "@/app/actions/school"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  schoolId: number
  schoolName: string
  currentCode: string | null
}

export function SchoolCodeForm({
  schoolId,
  schoolName,
  currentCode,
}: Props) {
  const router = useRouter()
  const [code, setCode] = useState(currentCode ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateSchoolCode(schoolId, code)

      if (result.success) {
        toast.success(result.message)
        router.refresh()
        router.push("/dashboard/schools")
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6 rounded-lg border p-6">
      <div>
        <h2 className="text-lg font-semibold">{schoolName}</h2>
        <p className="text-sm text-muted-foreground">
          Configure the permanent identification code for this school.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="schoolCode" className="text-sm font-medium">
          School Code
        </label>

        <Input
          id="schoolCode"
          value={code}
          onChange={(event) =>
            setCode(event.target.value.toUpperCase())
          }
          placeholder="e.g. ECIS"
          maxLength={10}
          required
        />

        <p className="text-xs text-muted-foreground">
          Use 2–10 letters or numbers. This code will be used when
          generating student admission numbers.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save School Code"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/schools")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
