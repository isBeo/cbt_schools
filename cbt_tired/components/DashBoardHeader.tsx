import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
const DashBoardHeader = () => {
  return (
    <header className="flex h-16 items-center gap-4 border-b px-6">
      <SidebarTrigger />

      <Separator orientation="vertical" className="h-full" />

      <div>
        <h2 className="font-semibold">Dashboard</h2>

        <p className="text-sm text-muted-foreground">CBT Management System</p>
      </div>
    </header>
  )
}

export default DashBoardHeader
