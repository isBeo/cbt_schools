
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AppSidebar } from "@/components/App_sideBar"
import DashBoardHeader from "@/components/DashBoardHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { role, schoolId } = session.user

  if (!role) {
    redirect("/login")
  }

  const school = schoolId
    ? await prisma.school.findUnique({
        where: { id: schoolId },
        select: { name: true },
      })
    : null

  return (
    <SidebarProvider>
      <AppSidebar
        role={role}
        schoolName={school?.name ?? undefined}
      />

      <SidebarInset>
        <DashBoardHeader />

        <main className="p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
