import { parseQuestionText } from "./lib/question-import-parser"

const invalidText = `
QUESTION: What is the capital of Nigeria?
MARKS: 2
A: Lagos
B: Abuja
C: Kano
ANSWER: B
---
QUESTION: Which is a programming language?
MARKS: 1
A: HTML
B: CSS
C: Python
D: SQL
ANSWER: E
---
QUESTION: What is 2 + 2?
MARKS: 0
A: 2
B: 3
C: 4
D: 5
ANSWER: C
`

const result = parseQuestionText(invalidText)

console.log(JSON.stringify(result, null, 2))
