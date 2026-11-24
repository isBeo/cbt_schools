import { LoaderCircle } from "lucide-react"

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">
        Preparing your examination completion details...
      </p>
    </main>
  )
}
