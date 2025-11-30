import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { formLinkSchema } from "@/lib/validations"
import { generateToken } from "@/lib/utils/token"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const formLinks = await query(`
      SELECT 
        fl.id,
        fl."departmentId",
        d.name as "departmentName",
        fl.token,
        fl.title,
        fl."expiresAt",
        fl."createdAt"
      FROM "FormLink" fl
      JOIN "Department" d ON fl."departmentId" = d.id
      ORDER BY fl."createdAt" DESC
    `)
    return NextResponse.json(formLinks)
  } catch (error) {
    console.error("Error fetching form links:", error)
    return NextResponse.json({ error: "Failed to fetch form links" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = formLinkSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 })
    }

    const { departmentId, title, expiresAt } = validatedData.data
    const token = generateToken(48)

    await query(
      `INSERT INTO "FormLink" ("departmentId", token, title, "expiresAt", "createdById", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [departmentId, token, title || null, expiresAt ? new Date(expiresAt) : null, session.userId],
    )

    return NextResponse.json({ success: true, token }, { status: 201 })
  } catch (error) {
    console.error("Error creating form link:", error)
    return NextResponse.json({ error: "Failed to create form link" }, { status: 500 })
  }
}
