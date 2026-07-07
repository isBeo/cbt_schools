"use server"

import { prisma } from "@/lib/prisma"

export async function importBusinessStudiesExam() {
  const exam = await prisma.exam.findFirst()

  if (!exam) {
    throw new Error("No exam found.")
  }

  const questions = [
    {
      questionText:
        "A person who buys goods and services for personal use is called a",
      marks: 1,
      options: [
        { text: "Producer", correct: false },
        { text: "Seller", correct: false },
        { text: "Consumer", correct: true },
        { text: "Manufacturer", correct: false },
      ],
    },

    {
      questionText:
        "The place where buyers and sellers meet to exchange goods and services is known as",
      marks: 1,
      options: [
        { text: "Shop", correct: false },
        { text: "Store", correct: false },
        { text: "Market", correct: true },
        { text: "Warehouse", correct: false },
      ],
    },

    {
      questionText:
        "The process of identifying, anticipating and satisfying customer needs profitably is called",
      marks: 1,
      options: [
        { text: "Selling", correct: false },
        { text: "Buying", correct: false },
        { text: "Marketing", correct: true },
        { text: "Trading", correct: false },
      ],
    },

    {
      questionText:
        "The act of making goods and services known to the public is called",
      marks: 1,
      options: [
        { text: "Promotion", correct: false },
        { text: "Publicity", correct: false },
        { text: "Advertising", correct: true },
        { text: "Distribution", correct: false },
      ],
    },

    {
      questionText: "Which of the following is NOT a medium of advertising?",
      marks: 1,
      options: [
        { text: "Radio", correct: false },
        { text: "Television", correct: false },
        { text: "Textbook", correct: true },
        { text: "Newspaper", correct: false },
      ],
    },

    {
      questionText: "The main purpose of advertising is to",
      marks: 1,
      options: [
        { text: "Hide products", correct: false },
        { text: "Reduce demand", correct: false },
        { text: "Inform consumers", correct: true },
        { text: "Stop production", correct: false },
      ],
    },

    {
      questionText: "A consumer right includes",
      marks: 1,
      options: [
        { text: "Right to cheat", correct: false },
        { text: "Right to deceive", correct: false },
        { text: "Right to safety", correct: true },
        { text: "Right to exploit", correct: false },
      ],
    },
    {
      questionText: "How many types of market do we have?",
      marks: 1,
      options: [
        { text: "Two", correct: false },
        { text: "Three", correct: false },
        { text: "Four", correct: true },
        { text: "Five", correct: false },
      ],
    },

    {
      questionText: "Which of these is NOT part of the marketing mix?",
      marks: 1,
      options: [
        { text: "Product", correct: false },
        { text: "Price", correct: false },
        { text: "Punishment", correct: true },
        { text: "Promotion", correct: false },
      ],
    },

    {
      questionText:
        "The person who brings goods from the producer to the consumer is called",
      marks: 1,
      options: [
        { text: "Manufacturer", correct: false },
        { text: "Retailer", correct: false },
        { text: "Middleman", correct: true },
        { text: "Accountant", correct: false },
      ],
    },

    {
      questionText: "Bookkeeping is mainly concerned with",
      marks: 1,
      options: [
        { text: "Selling goods", correct: false },
        { text: "Buying goods", correct: false },
        { text: "Recording transactions", correct: true },
        { text: "Keeping financial records", correct: false },
      ],
    },

    {
      questionText:
        "The principle that states 'for every debit there must be a credit' is called",
      marks: 1,
      options: [
        { text: "Accounting principle", correct: false },
        { text: "Trial balance principle", correct: false },
        { text: "Matching principle", correct: false },
        { text: "Double Entry Principle", correct: true },
      ],
    },

    {
      questionText:
        "The book used to record cash and bank transactions is called",
      marks: 1,
      options: [
        { text: "Ledger", correct: false },
        { text: "Journal", correct: false },
        { text: "Day Book", correct: false },
        { text: "Cash Book", correct: true },
      ],
    },

    {
      questionText: "In double entry, assets are increased by",
      marks: 1,
      options: [
        { text: "Credit entry", correct: false },
        { text: "No entry", correct: false },
        { text: "Both sides", correct: false },
        { text: "Debit entry", correct: true },
      ],
    },
    {
      questionText:
        "The person who prepares accounts in an organization is called",
      marks: 1,
      options: [
        { text: "Manager", correct: false },
        { text: "Clerk", correct: false },
        { text: "Supervisor", correct: false },
        { text: "Accountant", correct: true },
      ],
    },

    {
      questionText: "The left-hand side of the cash book is called",
      marks: 1,
      options: [
        { text: "Credit side", correct: false },
        { text: "Balance side", correct: false },
        { text: "Contra side", correct: false },
        { text: "Debit side", correct: true },
      ],
    },

    {
      questionText: "The right-hand side of the cash book is called",
      marks: 1,
      options: [
        { text: "Debit side", correct: false },
        { text: "Balance side", correct: false },
        { text: "Contra side", correct: false },
        { text: "Credit side", correct: true },
      ],
    },

    {
      questionText: "The book of original entry is also known as",
      marks: 1,
      options: [
        { text: "Ledger", correct: false },
        { text: "Balance Sheet", correct: false },
        { text: "Trial Balance", correct: false },
        { text: "Journal", correct: true },
      ],
    },

    {
      questionText:
        "When cash is paid into the bank, it is recorded in the cash book as",
      marks: 1,
      options: [
        { text: "Credit cash, debit bank", correct: false },
        { text: "Debit cash, credit bank", correct: false },
        { text: "Debit both sides", correct: false },
        { text: "Debit bank, credit cash", correct: true },
      ],
    },

    {
      questionText: "The double entry principle helps to",
      marks: 1,
      options: [
        { text: "Hide fraud", correct: false },
        { text: "Reduce profit", correct: false },
        { text: "Increase expenses", correct: false },
        { text: "Detect errors and frauds", correct: true },
      ],
    },
  ]

  // ⛔ Don't add insertion code yet.
  // We'll add it in Part 3 after all questions are included.
    // Prevent duplicate imports
  const existing = await prisma.question.count({
    where: {
      examId: exam.id,
    },
  })

  if (existing > 0) {
    return {
      success: false,
      message: "Questions have already been imported.",
    }
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]

    await prisma.question.create({
      data: {
        examId: exam.id,
        questionText: q.questionText,
        questionType: "OBJECTIVE",
        marks: q.marks,
        questionOrder: i + 1,

        options: {
          create: q.options.map((option, index) => ({
            optionText: option.text,
            optionOrder: index + 1,
            isCorrect: option.correct,
          })),
        },
      },
    })
  }

  return {
    success: true,
    message: `${questions.length} questions imported successfully.`,
  }
}
   
 
