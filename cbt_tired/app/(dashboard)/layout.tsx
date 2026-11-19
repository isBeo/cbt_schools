
import { redirect } from "next/navigation"

import { auth } from "@/auth"
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

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <DashBoardHeader />

        <main className="p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
