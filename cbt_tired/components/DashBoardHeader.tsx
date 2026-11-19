
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "@/components/auth/LogoutButton"

const DashBoardHeader = () => {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />

        <Separator orientation="vertical" className="h-full" />

        <div>
          <h2 className="font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            CBT Management System
          </p>
        </div>
      </div>

      <LogoutButton />
    </header>
  )
}

export default DashBoardHeader
