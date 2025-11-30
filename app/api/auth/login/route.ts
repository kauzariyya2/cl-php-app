import { NextResponse } from "next/server"
import { loginSchema } from "@/lib/validations"
import { verifyPassword, createSession } from "@/lib/auth"
import { queryOne } from "@/lib/db"

interface UserRecord {
  id: number
  email: string
  password: string
  name: string | null
  role: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 })
    }

    const { email, password } = validatedData.data

    const user = await queryOne<UserRecord>('SELECT id, email, password, name, role FROM "User" WHERE email = $1', [
      email,
    ])

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
