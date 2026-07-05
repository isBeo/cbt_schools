"use client"

import { Button } from "@/components/ui/button"
import { deleteSchool } from "../actions/create_school"

export default function Page() {
  async function handleDelete() {
    await deleteSchool(8)
  }

  return <Button onClick={handleDelete}>Delete School</Button>
}
