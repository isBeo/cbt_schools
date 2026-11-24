export type ImportedQuestion = {
  questionText: string
  marks: number
  options: {
    optionText: string
    optionOrder: number
    isCorrect: boolean
  }[]
}

export type QuestionImportIssue = {
  questionNumber: number
  message: string
}

export type QuestionImportResult = {
  questions: ImportedQuestion[]
  errors: QuestionImportIssue[]
  totalBlocks: number
}

type Field = "QUESTION" | "MARKS" | "A" | "B" | "C" | "D" | "ANSWER"

const OPTION_FIELDS = ["A", "B", "C", "D"] as const

export function parseQuestionText(input: string): QuestionImportResult {
  const text = input
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .trim()

  if (!text) {
    return {
      questions: [],
      errors: [
        {
          questionNumber: 0,
          message: "No question text was provided.",
        },
      ],
      totalBlocks: 0,
    }
  }

  const blocks = text
    .split(/^\s*---\s*$/m)
    .map((block) => block.trim())
    .filter(Boolean)

  const questions: ImportedQuestion[] = []
  const errors: QuestionImportIssue[] = []

  blocks.forEach((block, index) => {
    const questionNumber = index + 1

    const fields: Partial<Record<Field, string>> = {}
    let currentField: Field | null = null
    const blockErrors: string[] = []

    const lines = block.split("\n")

    for (const line of lines) {
      const match = line.match(
        /^\s*(QUESTION|MARKS|A|B|C|D|ANSWER)\s*:\s*(.*)$/i
      )

      if (match) {
        const field = match[1].toUpperCase() as Field
        const value = match[2].trim()

        if (fields[field] !== undefined) {
          blockErrors.push(`Duplicate ${field} field.`)
          currentField = null
          continue
        }

        fields[field] = value
        currentField = field
        continue
      }

      if (!line.trim()) continue

      if (!currentField) {
        blockErrors.push(`Unrecognised line: "${line.trim()}".`)
        continue
      }

      fields[currentField] = [fields[currentField] ?? "", line.trim()]
        .filter(Boolean)
        .join("\n")
    }

    if (!fields.QUESTION?.trim()) {
      blockErrors.push("Missing QUESTION field.")
    }

    const marksText = fields.MARKS?.trim()

    if (!marksText) {
      blockErrors.push("Missing MARKS field.")
    } else if (!/^\d+$/.test(marksText) || Number(marksText) <= 0) {
      blockErrors.push("MARKS must be a positive whole number.")
    }

    for (const option of OPTION_FIELDS) {
      if (!fields[option]?.trim()) {
        blockErrors.push(`Missing or empty option ${option}.`)
      }
    }

    const answer = fields.ANSWER?.trim().toUpperCase()

    if (!answer) {
      blockErrors.push("Missing ANSWER field.")
    } else if (
      !OPTION_FIELDS.includes(answer as (typeof OPTION_FIELDS)[number])
    ) {
      blockErrors.push("ANSWER must be A, B, C or D.")
    }

    if (blockErrors.length > 0) {
      blockErrors.forEach((message) => {
        errors.push({ questionNumber, message })
      })
      return
    }

    questions.push({
      questionText: fields.QUESTION!.trim(),
      marks: Number(marksText),
      options: OPTION_FIELDS.map((option, index) => ({
        optionText: fields[option]!.trim(),
        optionOrder: index + 1,
        isCorrect: answer === option,
      })),
    })
  })

  return {
    questions,
    errors,
    totalBlocks: blocks.length,
  }
}
