
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "Student Management",
    description:
      "Manage student records, admission details and class information from one place.",
  },
  {
    title: "Examination Management",
    description:
      "Create examinations, manage questions and conduct computer-based tests.",
  },
  {
    title: "Results Management",
    description:
      "Record, calculate and manage student examination results efficiently.",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero section */}
      <section className="relative isolate min-h-[680px] overflow-hidden bg-slate-950">
        <Image
          src="/images/ace-schools-hero.jpg"
          alt="Students learning in a modern classroom"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30" />

        {/* Header */}
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-white">
            Ace<span className="text-cyan-400">-Schools</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-white/50 bg-white/10 text-white hover:bg-white hover:text-slate-950"
              >
                Sign In
              </Button>
            </Link>

            <Link href="/student">
              <Button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                Student Portal
              </Button>
            </Link>
          </nav>
        </header>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-center px-6 py-20 lg:px-10">
          <div className="max-w-2xl space-y-7">
            <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
              Smart School Management Platform
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              One platform.
              <br />
              A better way to
              <br />
              <span className="text-cyan-400">manage your school.</span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-slate-200">
              Simplify school administration, manage students and teachers,
              conduct examinations and organise academic results with Ace-Schools.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/login">
                <Button size="lg" className="bg-cyan-500 px-8 text-slate-950 hover:bg-cyan-400">
                  Access Your Account
                </Button>
              </Link>

              <Link href="/student">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 bg-white/10 px-8 text-white hover:bg-white hover:text-slate-950"
                >
                  Start Examination
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 font-semibold text-cyan-600">
            THE ACE-SCHOOLS PLATFORM
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Everything your school needs in one place
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Bring important school operations together through one organised
            digital platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-cyan-50 text-lg font-bold text-cyan-700">
                0{index + 1}
              </div>

              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {feature.title}
              </h3>

              <p className="leading-7 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-8 text-center">
        <p className="font-semibold text-slate-700">
          Ace-Schools
        </p>
        <p className="mt-2 text-sm text-slate-500">
          A smarter approach to school management and examinations.
        </p>
      </footer>
    </main>
  )
}
