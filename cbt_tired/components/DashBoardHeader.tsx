import { auth } from "@/auth"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { ThemeToggle } from "@/components/theme-toggle"

const DashBoardHeader = async () => {
  const session = await auth()

  const fullName = session?.user?.name?.trim() || ""
  const firstName = fullName.split(/\s+/)[0]

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />

        <Separator orientation="vertical" className="h-full" />

        <div>
          <h2 className="font-semibold">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h2>

          <p className="text-sm text-muted-foreground">
            Ace-Schools · School Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  )
}

export default DashBoardHeader
