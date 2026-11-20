
import { z } from "zod"

export const schoolSchema = z.object({
  name: z.string().trim().min(3, "School name must be at least 3 characters"),

  address: z.string().trim().min(5, "Address must be at least 5 characters"),

  adminName: z.string().trim().min(2, "Administrator name is required"),

  adminEmail: z
    .string()
    .trim()
    .email("Enter a valid administrator email address")
    .transform((email) => email.toLowerCase()),

  adminPassword: z
    .string()
    .min(8, "Temporary password must be at least 8 characters"),
})

export type SchoolInput = z.infer<typeof schoolSchema>
