<!-- This answers:

What is CBT Tired?
Who are the users?
What are the project goals?
Coding philosophy.
Tech stack.
High-level roadmap. -->

# Architecture

## Style

The application follows a modular SaaS architecture.

```
Presentation
      │
Business Logic
      │
Server Actions
      │
Prisma
      │
Database
```

---

## Multi-tenancy

Every resource belongs to a School.

Never expose another school's data.

Always filter by:

```ts
schoolId
```

---

## Layers

Presentation

Business Logic

Persistence

Database

Never mix responsibilities.

---

## Data Flow

Browser

↓

Server Component

↓

Server Action

↓

Prisma

↓

PostgreSQL