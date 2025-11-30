import { NextResponse } from "next/server"
import { loginSchema } from "@/lib/validations"
import { verifyPassword, createSession } from "@/lib/auth"
import { sql } from "@/lib/db"

interface AdminRecord {
  id: number
  email: string
  password: string
  name: string | null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 })
    }

    const { email, password } = validatedData.data

    const rows = await sql`SELECT id, email, password, name FROM "Admin" WHERE email = ${email}`
    const admin = rows[0] as AdminRecord | undefined

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, admin.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await createSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: "admin",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
