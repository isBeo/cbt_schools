"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { Role } from "@/lib/generated/prisma/client"
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

type AppSidebarProps = {
  role: Role
  schoolName?: string
}

type MenuItem = {
  title: string
  url: string
  icon: React.ElementType
  roles: Role[]
}

const allRoles: Role[] = [
  "SUPER_ADMIN",
  "SCHOOL_ADMIN",
  "TEACHER",
  "STUDENT",
  "PARENT",
]

const mainItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: RiDashboardLine,
    roles: allRoles,
  },
]

const academicItems: MenuItem[] = [
  {
    title: "Academic Setup",
    url: "/dashboard/academic-setup",
    icon: RiSettings4Line,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    title: "Schools",
    url: "/dashboard/schools",
    icon: RiSchoolLine,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Classes",
    url: "/dashboard/classes",
    icon: RiBook2Line,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: RiGroupLine,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    title: "Subjects",
    url: "/dashboard/subjects",
    icon: RiBook2Line,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    title: "Teachers",
    url: "/dashboard/teachers",
    icon: RiGroupLine,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    title: "Teacher Assignments",
    url: "/dashboard/teacher-assignments",
    icon: RiGraduationCapLine,
    roles: ["SCHOOL_ADMIN"],
  },
]

const examinationItems: MenuItem[] = [
  {
    title: "Student Registration",
    url: "/register",
    icon: RiGroupLine,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    title: "Question Bank",
    url: "/dashboard/questions",
    icon: RiQuestionLine,
    roles: ["SCHOOL_ADMIN", "TEACHER"],
  },
  {
    title: "Exams",
    url: "/dashboard/exams",
    icon: RiFileList3Line,
    roles: ["SCHOOL_ADMIN", "TEACHER"],
  },
  {
    title: "Results",
    url: "/dashboard/results",
    icon: RiBarChartLine,
    roles: ["SCHOOL_ADMIN", "TEACHER"],
  },
]

export function AppSidebar({ role, schoolName }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const { state, isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  function renderItems(items: MenuItem[]) {
    return items
      .filter((item) => item.roles.includes(role))
      .map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            isActive={
              pathname === item.url ||
              (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`))
            }
            onClick={() => router.push(item.url)}
            tooltip={item.title}
          >
            <item.icon className="size-5" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center p-4">
        {state === "collapsed" ? (
          <RiGraduationCapLine className="size-7 text-primary" />
        ) : (
          <div className="flex items-center gap-3">
            <RiGraduationCapLine className="size-7 text-primary" />

            <div className="min-w-0">
              <h2 className="my-1 truncate leading-none font-bold">
                {schoolName || "Ace-Schools"}
              </h2>

              <p className="text-xs text-muted-foreground">
                {role.replace("_", " ")}
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>OVERVIEW</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {academicItems.some((item) => item.roles.includes(role)) && (
          <SidebarGroup>
            <SidebarGroupLabel>ACADEMICS</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>{renderItems(academicItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {examinationItems.some((item) => item.roles.includes(role)) && (
          <SidebarGroup>
            <SidebarGroupLabel>EXAMINATIONS</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>{renderItems(examinationItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
