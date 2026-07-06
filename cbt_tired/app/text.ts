"use server"



import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string(),
})

// const resolver = zodResolver(schema)