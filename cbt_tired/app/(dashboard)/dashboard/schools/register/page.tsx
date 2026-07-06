import { SchoolForm } from "@/components/forms/school_form"
import React from "react"

const register = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New School</h1>
        <p className="text-muted-foreground">Register a new school.</p>
      </div>

      <SchoolForm />
    </div>
  )
}

export default register
