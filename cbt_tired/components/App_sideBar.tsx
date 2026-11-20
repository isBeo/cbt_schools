"use client"

import {  useSidebar } from "@/components/ui/sidebar"
import { RiGraduationCapLine } from "@remixicon/react"
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: RiDashboardLine,
  },
]

const academicItems = [
  {
    title: "Academic Setup",
    url: "/dashboard/academic-setup",
    icon: RiSettings4Line,
  },
  {
    title: "Schools",
    url: "/dashboard/schools",
    icon: RiSchoolLine,
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
    title: "Teacher Management",
    url: "/dashboard/teachers",
    icon: RiGroupLine,
  },
  {
    title: "Teacher Assignments",
    url: "/dashboard/teacher-assignments",
    icon: RiGraduationCapLine,
  },
]

const examItems = [
  {
    title: "Student Registration",
    url: "/register",
    icon: RiGroupLine,
  },
  {
  title: "Question Bank",
  url: "/dashboard/questions",
  icon: RiQuestionLine,
},
{
  title: "Teacher Activity",
  url: "/dashboard/audit-logs",
  icon: RiFileList3Line,
},
  {
    title: "Exams",
    url: "/dashboard/exams",
    icon: RiFileList3Line,
  },
  {
    title: "Upload Questions",
    url: "/dashboard/exams/import",
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
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center p-4">
        {state === "collapsed" ? (
          <RiGraduationCapLine className="size-7 text-primary" />
        ) : (
          <div className="flex items-center gap-3">
            <RiGraduationCapLine className="size-7 text-primary" />

            <div>
              <h2 className="leading-none my-1 font-bold">Eagle Crest</h2>

              <p className="text-xs text-muted-foreground">CBT System</p>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Panel</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 p-2"
                    >
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>ACADEMICS</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {academicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 p-2"
                    >
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>EXAMINATION</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {examItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 p-2"
                    >
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
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
