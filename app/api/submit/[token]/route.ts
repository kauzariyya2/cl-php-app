import { NextResponse } from "next/server"
import { submissionSchema } from "@/lib/validations"
import { query, queryOne } from "@/lib/db"
import { headers } from "next/headers"

interface FormLink {
  id: number
  departmentId: number
  expiresAt: Date | null
}

interface Question {
  id: number
  required: boolean
}

interface InsertResult {
  id: number
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    const formLink = await queryOne<FormLink>(
      'SELECT id, "departmentId", "expiresAt" FROM "FormLink" WHERE token = $1',
      [token],
    )

    if (!formLink) {
      return NextResponse.json({ error: "Invalid form link" }, { status: 404 })
    }

    // Check expiration
    if (formLink.expiresAt && new Date(formLink.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This link has expired" }, { status: 410 })
    }

    const body = await request.json()
    const validatedData = submissionSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 })
    }

    const { name, email, answers } = validatedData.data

    const questions = await query<Question[]>('SELECT id, required FROM "Question" WHERE "departmentId" = $1', [
      formLink.departmentId,
    ])

    // Validate required answers
    for (const question of questions) {
      if (question.required && !answers[question.id.toString()]) {
        return NextResponse.json({ error: "Please answer all required questions" }, { status: 400 })
      }
    }

    // Get IP address
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "unknown"

    const result = await query<InsertResult[]>(
      `INSERT INTO "Submission" ("formLinkId", name, email, "ipAddress", "submittedAt") 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
      [formLink.id, name || null, email || null, ipAddress],
    )

    const submissionId = result[0].id

    // Create submission answers
    for (const [questionId, answer] of Object.entries(answers)) {
      if (answer) {
        await query(
          `INSERT INTO "SubmissionAnswer" ("submissionId", "questionId", answer, "createdAt") 
           VALUES ($1, $2, $3, NOW())`,
          [submissionId, Number.parseInt(questionId), JSON.stringify(answer)],
        )
      }
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
  }
}
