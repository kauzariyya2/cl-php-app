import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await query('DELETE FROM "FormLink" WHERE id = $1', [Number.parseInt(id)])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form link:", error)
    return NextResponse.json({ error: "Failed to delete form link" }, { status: 500 })
  }
}
