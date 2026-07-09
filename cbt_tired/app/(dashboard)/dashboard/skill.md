# Dashboard Page Skill

## Purpose

This document describes the admin dashboard page in the CBT Tired application. The dashboard provides an at-a-glance summary of key system metrics for administrators.

## Page Behavior

- The dashboard is a server-rendered React component located at `app/(dashboard)/dashboard/page.tsx`.
- It uses Prisma to query counts for the main entities in the system.
- The component fetches the following counts in parallel:
  - `School`
  - `Student`
  - `Class`
  - `Subject`
  - `Exam`
  - `ExamAttempt`
- The data is displayed through reusable `StatCard` components.

## UI Layout

- The page contains a header with the title `Dashboard` and a short welcome description.
- It renders six statistic cards in a responsive grid layout.
- Each card includes:
  - A title (e.g. `Schools`, `Students`)
  - A numeric value from Prisma counts
  - An icon imported from `lucide-react`
  - A descriptive label

## Dependencies

- `@/lib/prisma` for database access
- `./components/StatCard` for displaying summary statistics
- `lucide-react` icons:
  - `School`
  - `Users`
  - `GraduationCap`
  - `BookOpen`
  - `ClipboardList`
  - `BarChart3`

## Notes

- The dashboard is read-only and does not perform mutations.
- It is intended for the admin area under the `(dashboard)` route group.
- Any change to the Prisma schema affecting these models should be validated with the dashboard data counts.
