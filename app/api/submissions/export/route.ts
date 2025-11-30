import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

interface SubmissionRow {
  id: number
  name: string | null
  email: string | null
  departmentName: string
  formLinkTitle: string | null
  submittedAt: Date
  questionText: string
  answer: string
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const formLinkId = searchParams.get("formLinkId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    let sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        d.name as "departmentName",
        fl.title as "formLinkTitle",
        s."submittedAt",
        q."questionText",
        sa.answer
      FROM "Submission" s
      JOIN "FormLink" fl ON s."formLinkId" = fl.id
      JOIN "Department" d ON fl."departmentId" = d.id
      LEFT JOIN "SubmissionAnswer" sa ON sa."submissionId" = s.id
      LEFT JOIN "Question" q ON sa."questionId" = q.id
      WHERE 1=1
    `
    const params: unknown[] = []
    let paramIndex = 1

    if (department && department !== "all") {
      sql += ` AND d.name = $${paramIndex}`
      params.push(department)
      paramIndex++
    }
    if (formLinkId && formLinkId !== "all") {
      sql += ` AND fl.id = $${paramIndex}`
      params.push(Number.parseInt(formLinkId))
      paramIndex++
    }
    if (dateFrom) {
      sql += ` AND s."submittedAt" >= $${paramIndex}`
      params.push(new Date(dateFrom))
      paramIndex++
    }
    if (dateTo) {
      sql += ` AND s."submittedAt" <= $${paramIndex}`
      params.push(new Date(dateTo + "T23:59:59"))
      paramIndex++
    }

    sql += ' ORDER BY s."submittedAt" DESC, s.id, q."sortOrder"'

    const rows = await query<SubmissionRow[]>(sql, params)

    // Build CSV
    const csvRows: string[] = []
    csvRows.push("ID,Name,Email,Department,Form Link,Submitted At,Question,Answer")

    for (const row of rows) {
      const answer = row.answer ? (typeof row.answer === "string" ? JSON.parse(row.answer) : row.answer) : ""
      csvRows.push(
        [
          row.id,
          `"${(row.name || "Anonymous").replace(/"/g, '""')}"`,
          `"${(row.email || "").replace(/"/g, '""')}"`,
          `"${row.departmentName.replace(/"/g, '""')}"`,
          `"${(row.formLinkTitle || "").replace(/"/g, '""')}"`,
          new Date(row.submittedAt).toISOString(),
          `"${(row.questionText || "").replace(/"/g, '""')}"`,
          `"${String(answer).replace(/"/g, '""')}"`,
        ].join(","),
      )
    }

    const csv = csvRows.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="submissions-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting submissions:", error)
    return NextResponse.json({ error: "Failed to export" }, { status: 500 })
  }
}
