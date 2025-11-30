import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { questionSchema } from "@/lib/validations"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("departmentId")

    let sql = `
      SELECT 
        q.id,
        q."departmentId",
        d.name as "departmentName",
        q."questionText",
        q.type,
        q.options,
        q.required,
        q."sortOrder",
        q."createdAt"
      FROM "Question" q
      JOIN "Department" d ON q."departmentId" = d.id
    `
    const params: unknown[] = []

    if (departmentId) {
      sql += ' WHERE q."departmentId" = $1'
      params.push(Number.parseInt(departmentId))
    }

    sql += ' ORDER BY q."sortOrder", q."createdAt"'

    const questions = await query(sql, params)
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = questionSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 })
    }

    const { departmentId, questionText, type, options, required, sortOrder } = validatedData.data

    await query(
      `INSERT INTO "Question" ("departmentId", "questionText", type, options, required, "sortOrder", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [departmentId, questionText, type, options ? JSON.stringify(options) : null, required, sortOrder],
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
