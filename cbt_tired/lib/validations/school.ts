import { z } from "zod"

export const schoolSchema = z.object({
  name: z.string().trim().min(3, "School name must be at least 3 characters"),

  address: z.string().trim().min(5, "Address must be at least 5 characters"),
})

export type SchoolInput = z.infer<typeof schoolSchema>
