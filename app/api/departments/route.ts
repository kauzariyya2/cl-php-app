import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { departmentSchema } from "@/lib/validations"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const departments = await query(
      'SELECT id, name, description, "createdAt" FROM "Department" ORDER BY "createdAt" DESC',
    )
    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = departmentSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 })
    }

    const { name, description } = validatedData.data

    await query(
      'INSERT INTO "Department" (name, description, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
      [name, description || null],
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating department:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}
