
"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
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
  title: "Students",
  url: "/dashboard/students",
  icon: RiGroupLine,
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
  const pathname = usePathname()
  const router = useRouter()

  const {
    state,
    isMobile,
    setOpenMobile,
  } = useSidebar()

  // Close the mobile drawer after navigation.
  // Desktop sidebar remains open.
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  function navigateTo(url: string) {
    router.push(url)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center p-4">
        {state === "collapsed" ? (
          <RiGraduationCapLine className="size-7 text-primary" />
        ) : (
          <div className="flex items-center gap-3">
            <RiGraduationCapLine className="size-7 text-primary" />

            <div>
              <h2 className="my-1 font-bold leading-none">
                Eagle Crest
              </h2>
              <p className="text-xs text-muted-foreground">
                CBT System
              </p>
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
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    onClick={() => navigateTo(item.url)}
                    tooltip={item.title}
                  >
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
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
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    onClick={() => navigateTo(item.url)}
                    tooltip={item.title}
                  >
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
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
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    onClick={() => navigateTo(item.url)}
                    tooltip={item.title}
                  >
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
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
