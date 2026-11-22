"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { deleteExam } from "@/app/actions/exam"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  examId: number
  examTitle: string
}

export default function DeleteExam({ examId, examTitle }: Props) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)

    try {
      await deleteExam(examId)

      toast.success("Exam deleted successfully.")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete exam."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this exam?</DialogTitle>

          <DialogDescription>
            You are about to permanently delete "{examTitle}". Its questions and
            options will also be deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting..." : "Delete Exam"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
