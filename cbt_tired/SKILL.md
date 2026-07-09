# CBT Tired Project Skill

## Purpose

This repository is a Next.js-based computer-based test (CBT) platform for schools. It supports school setup, class and subject management, exam creation, student registration, exam-taking, answer submission, and result generation.

## Project Overview

- Framework: Next.js 16 with the App Router
- Language: TypeScript
- UI: React, Tailwind CSS, and shadcn/ui components
- Data layer: Prisma with PostgreSQL
- Forms: react-hook-form + Zod validation
- Runtime pattern: Server components by default, with server actions for mutations

## Key Architecture

### App structure

- app/ contains route pages and route groups
- app/actions/ contains server actions for exam, school, and student workflows
- app/(dashboard)/dashboard/ contains the admin dashboard UI
- components/ contains reusable UI and form components
- components/ui/ contains shadcn-style primitives
- lib/ contains shared utilities, Prisma client wiring, and validation schemas
- prisma/schema.prisma is the source of truth for the database model
- generated/prisma/ is the generated Prisma client

### Important folders

- app/register: student registration flow
- app/student/[studentId]/exams: student exam selection page
- app/exam/[examId]: exam-taking experience
- app/result/[attemptId]: result page
- app/(dashboard)/dashboard/exams: admin exam management UI
- app/actions/exam.ts: exam creation, activation, closing, and submission logic
- app/actions/student.ts: student registration and redirect flow

## Core Domain Model

The database centers around these entities:

- School
- Class
- Subject
- Student
- Exam
- Question
- Option
- ExamAttempt
- StudentAnswer
- Result
- ResultDetail

### Exam lifecycle

- DRAFT: exam is being prepared
- PUBLISHED: exam is available for scheduling/activation
- ACTIVE: students can take it
- CLOSED: exam is no longer open

## Primary User Workflows

### Admin workflow

1. Create or manage schools
2. Create classes and subjects
3. Create an exam for a specific class and subject
4. Activate the exam so it becomes available to students
5. Review results and attempts

### Student workflow

1. Register a student with a selected class
2. View available exams for that class
3. Select an exam
4. Answer questions within the exam duration
5. Submit the exam
6. View the result/score summary

## Coding Conventions

- Use the App Router style already present in the project
- Prefer server components for data fetching and page rendering
- Place mutations in app/actions and mark them with "use server"
- Use react-hook-form for interactive forms
- Keep validation logic in lib/validations and use Zod schemas
- Use the existing shadcn/ui component patterns from components/ui
- Use the @/ alias for imports
- Keep changes minimal and consistent with the current structure
- Avoid using any when a real type can be provided

## Prisma and Database Rules

- Treat prisma/schema.prisma as the source of truth
- Do not edit generated/prisma files manually
- If the schema changes, create and apply a Prisma migration
- Use prisma client methods from lib/prisma.ts
- Be careful with relation wiring and required foreign keys

## UI and Form Guidance

- Reuse existing forms in components/forms rather than creating parallel patterns
- Keep forms accessible and consistent with the existing Tailwind styling
- Use existing Button, Input, Card, Dialog, and Table components from components/ui
- Preserve the current admin/student route structure unless a clear improvement requires change

## Important Implementation Notes

- Student registration currently creates a student record and routes the student to the exam-selection experience
- Exam submission creates an ExamAttempt, StudentAnswer records, and a Result
- Exam availability depends on the exam being linked to the student’s class and being in an accessible state
- Exams must have questions and options in order to be meaningful for students

## Verification Before Completion

Always verify changes before declaring success:

- Run npm run lint
- Run npm run build
- Run npx prisma generate dev when Prisma-related changes are made

## What to Change Carefully

- Exam flow logic in app/actions/exam.ts
- Student registration flow in app/actions/student.ts
- Student exam-selection page in app/student/[studentId]/exams/page.tsx
- Exam-taking UI in app/exam/[examId]/page.tsx and components/forms/ExamForm.tsx
- Prisma schema in prisma/schema.prisma

## Avoid

- Editing generated files directly
- Making schema changes without a migration
- Adding unrelated dependencies without strong justification
- Breaking the existing admin/student split in the route structure
- Using ad-hoc state for data that should be persisted server-side

## Quick Reference Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
npx prisma generate dev
npx prisma migrate dev
```

## Preferred Working Style

When making a change:

1. Read the relevant page, action, and form component together
2. Understand the data flow before editing
3. Make the smallest change that solves the issue
4. Verify with lint/build and, if needed, Prisma commands
5. Keep the student and admin experience consistent
