import { promises as fs } from "fs"
import path from "path"

export type QuestionFile = {
  questionText: string
  marks: number
  options: {
    text: string
    correct: boolean
  }[]
}

export async function loadQuestions(file: string): Promise<QuestionFile[]> {
  const filePath = path.join(process.cwd(), "data", "exams", file)

  const json = await fs.readFile(filePath, "utf8")

  return JSON.parse(json) as QuestionFile[]
}
