import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { questionSchema } from "@/lib/validations"
import { query, queryOne } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const question = await queryOne(
      'SELECT id, "departmentId", "questionText", type, options, required, "sortOrder" FROM "Question" WHERE id = $1',
      [Number.parseInt(id)],
    )

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = questionSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 })
    }

    const { departmentId, questionText, type, options, required, sortOrder } = validatedData.data

    await query(
      `UPDATE "Question" 
       SET "departmentId" = $1, "questionText" = $2, type = $3, options = $4, required = $5, "sortOrder" = $6, "updatedAt" = NOW() 
       WHERE id = $7`,
      [
        departmentId,
        questionText,
        type,
        options ? JSON.stringify(options) : null,
        required,
        sortOrder,
        Number.parseInt(id),
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await query('DELETE FROM "Question" WHERE id = $1', [Number.parseInt(id)])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
