import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold text-blue-900 md:text-5xl">
          Eagle Crestwood International School
        </h1>

        <p className="text-lg text-muted-foreground">
          Welcome to the CBT Examination Center
        </p>

        <Link href="/student">
          <Button size="lg" className="px-8">
            Start Examination
          </Button>
        </Link>
      </div>
    </main>
  )
}
