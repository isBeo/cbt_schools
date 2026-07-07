import { SchoolTable } from "@/components/tables/schoolTable"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function SchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-muted-foreground">
            Manage all registered schools.
          </p>
        </div>

          <Link href="/dashboard/schools/register" className={'font-bolder'} ><Plus/> 
          
          <span>Add</span>
          </Link>
      </div>

      <SchoolTable schools={schools} />
    </div>
  )
}
