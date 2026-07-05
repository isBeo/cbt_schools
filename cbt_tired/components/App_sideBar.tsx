"use client"

import Link from "next/link"
import {
  RiDashboardLine,
  RiSchoolLine,
  RiGroupLine,
  RiBook2Line,
  RiFileList3Line,
  RiQuestionLine,
  RiBarChartLine,
  RiSettings4Line,
} from "@remixicon/react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link2 } from "lucide-react"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: RiDashboardLine,
  },
  {
    title: "Schools",
    url: "/dashboard/schools",
    icon: RiSchoolLine,
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: RiGroupLine,
  },
  {
    title: "Classes",
    url: "/dashboard/classes",
    icon: RiBook2Line,
  },
  {
    title: "Subjects",
    url: "/dashboard/subjects",
    icon: RiBook2Line,
  },
  {
    title: "Exams",
    url: "/dashboard/exams",
    icon: RiFileList3Line,
  },
  {
    title: "Questions",
    url: "/dashboard/questions",
    icon: RiQuestionLine,
  },
  {
    title: "Results",
    url: "/dashboard/results",
    icon: RiBarChartLine,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: RiSettings4Line,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-bold">CBT Admin</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton >
                    {/* <Link href={item.url}>
                      <item.icon /> */}
                      <Link2 ></Link2>
                      <span>{item.title}</span>
                    {/* </Link> */}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
