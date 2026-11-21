## ref: 21112026T1748

Passed
 School isolation during student registration

The server action derives schoolId from the authenticated School Admin's session. It also verifies that the selected class belongs to that school. A School Admin cannot simply submit another school's class ID to register a student there.

Passed
 Admission number concurrency

Your PostgreSQL INSERT ... ON CONFLICT DO UPDATE sequence increment is atomic. This is the right approach to prevent two simultaneous registrations from receiving the same generated serial number.

Passed
 Password handling

- Temporary passwords are generated using cryptographically secure random bytes.
- Passwords are hashed with bcrypt before storage.
- Passwords are not included in the audit log.

Passed
 Registration transaction

Student account creation, student record creation and audit logging happen in one database transaction. If one fails, the transaction rolls back.
Your auth.ts already supports student authentication using:

School Code + Admission Number + Password

However, your current login page only displays email and password fields. Students cannot yet use the student login path through the interface.

That is an implementation gap, not a failure of the registration code.
1. Add runtime validation to registerStudent, preferably with your existing Zod validation approach. Server Actions must validate input even when the form already validates it.
2. Consider login rate limiting to protect staff and student accounts from repeated password guesses.
3. Consider session invalidation when an account's role or school assignment changes.
These are audit improvements; I would not rewrite the working registration flow before inspecting the rest of the system.
This is especially important because students must not access another student's exam or individual scores.

Please share these files next:

1. Exam submission action
```
cat "app/exam/[examId]/actions.ts"
```
2. Exam page
```
cat "app/exam/[examId]/page.tsx"
```
3. Student dashboard
```
cat "app/student/[studentId]/page.tsx"
```
4. Student examination list
```
cat "app/student/[studentId]/exams/page.tsx"
```
5. Result page
```
cat "app/result/[attemptId]/page.tsx"
```
I'll check whether:
- A student can manipulate URL parameters to access another student's exam.
- Students can submit answers for exams outside their class.
- Students can submit the same examination multiple times.
- Students can view individual attempt scores or correct answers.
- Examination results are protected from unauthorized access.
We should complete this audit before calling the current version ready for the next development milestone.