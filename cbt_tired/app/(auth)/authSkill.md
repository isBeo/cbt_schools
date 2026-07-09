# Authentication Milestone 1 — Foundation

## Objective

Implement the authentication foundation for the CBT Tired application.

This milestone establishes the project's authentication infrastructure only.

At the completion of this milestone, authenticated users should be able to log in, maintain a session, and log out successfully.

Role-based authorization and route protection are intentionally deferred to Milestone 2.

---

# Scope

Only implement the following:

- Add the User model
- Add the Role enum
- Create and apply the Prisma migration
- Install and configure Auth.js (NextAuth v5)
- Configure the Prisma Adapter
- Configure the Credentials Provider
- Implement password hashing
- Implement login
- Implement logout
- Ensure sessions are working

Do **not** implement authorization in this milestone.

---

# Deliverables

## Database

Add a new User model.

The User model should become the application's authentication identity.

Fields should include:

- id
- name
- email
- password
- role
- schoolId (nullable if required initially)
- createdAt
- updatedAt

Email must be unique.

Passwords must never be stored in plain text.

---

## Role Enum

Create the initial Role enum.

Supported roles:

- SUPER_ADMIN
- SCHOOL_ADMIN
- TEACHER
- STUDENT

No permission logic is required yet.

---

## Prisma

After updating the schema:

- Create a Prisma migration
- Apply the migration
- Regenerate the Prisma Client

Never edit generated Prisma files manually.

---

## Auth.js

Install and configure:

- Auth.js (NextAuth v5)
- Prisma Adapter
- Credentials Provider

Authentication should use the Prisma User model.

---

## Passwords

Hash passwords before saving.

Use bcrypt or Argon2.

During login:

- Compare hashed passwords
- Never compare plain text passwords

---

## Login

Create a login page.

The login form should include:

- Email
- Password
- Login button

Display friendly validation messages.

---

## Logout

Provide a logout action that destroys the current session.

---

## Sessions

A successful login should create a valid session.

The session should expose:

- user.id
- user.email
- user.role
- user.schoolId (if available)

Verify that sessions persist correctly.

---

# Not Included

Do NOT implement:

- Middleware
- Route protection
- Role-Based Access Control
- Permission helpers
- Sidebar filtering
- School isolation
- Student authentication changes
- OAuth providers
- Google login
- Microsoft login

These belong to future milestones.

---

# Success Criteria

Milestone 1 is complete when:

- A User can be created.
- Passwords are hashed.
- A User can log in.
- A valid session is created.
- The current session can be accessed.
- A User can log out successfully.

Nothing else is required.

---

# Development Guidelines

Follow existing project conventions:

- Next.js App Router
- Server Components by default
- Server Actions for mutations
- Prisma
- TypeScript
- Zod validation
- Tailwind CSS
- shadcn/ui

Avoid introducing new architectural patterns.

---

# Verification Checklist

Before considering the milestone complete:

- pnpm lint
- pnpm typecheck
- pnpm build

If Prisma changed:

- npx prisma migrate dev
- npx prisma generate

Resolve all errors before moving to Milestone 2.

---

# Exit Condition

When this milestone is finished:

✅ Users can log in.

✅ Users can log out.

✅ Sessions are working.

The project is now ready for Milestone 2:

- Middleware
- Protected routes
- Role-Based Access Control (RBAC)
- Route authorization
- Permission helpers