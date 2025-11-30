import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmissionList } from "@/components/admin/submission-list"
import { SubmissionFilters } from "@/components/admin/submission-filters"

interface Submission {
  id: number
  name: string | null
  email: string | null
  submittedAt: Date
  departmentName: string
  formLinkTitle: string | null
}

interface Department {
  id: number
  name: string
}

interface FormLink {
  id: number
  title: string | null
  token: string
}

async function getSubmissions(filters: {
  departmentId?: string
  formLinkId?: string
  startDate?: string
  endDate?: string
}): Promise<Submission[]> {
  let query = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s."submittedAt",
      d.name as "departmentName",
      fl.title as "formLinkTitle"
    FROM "Submission" s
    JOIN "FormLink" fl ON fl.id = s."formLinkId"
    JOIN "Department" d ON d.id = fl."departmentId"
    WHERE 1=1
  `
  const params: (string | number)[] = []
  let paramIndex = 1

  if (filters.departmentId) {
    query += ` AND fl."departmentId" = $${paramIndex}`
    params.push(Number.parseInt(filters.departmentId))
    paramIndex++
  }
  if (filters.formLinkId) {
    query += ` AND s."formLinkId" = $${paramIndex}`
    params.push(Number.parseInt(filters.formLinkId))
    paramIndex++
  }
  if (filters.startDate) {
    query += ` AND s."submittedAt" >= $${paramIndex}`
    params.push(filters.startDate)
    paramIndex++
  }
  if (filters.endDate) {
    query += ` AND s."submittedAt" <= $${paramIndex}`
    params.push(filters.endDate)
    paramIndex++
  }

  query += ` ORDER BY s."submittedAt" DESC`

  const submissions = await sql.unsafe(query, params)
  return submissions as Submission[]
}

async function getDepartments(): Promise<Department[]> {
  const departments = await sql`SELECT id, name FROM "Department" ORDER BY name`
  return departments as Department[]
}

async function getFormLinks(): Promise<FormLink[]> {
  const formLinks = await sql`SELECT id, title, token FROM "FormLink" ORDER BY "createdAt" DESC`
  return formLinks as FormLink[]
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const [submissions, departments, formLinks] = await Promise.all([
    getSubmissions({
      departmentId: params.departmentId,
      formLinkId: params.formLinkId,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    getDepartments(),
    getFormLinks(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Submissions</h1>
        <p className="mt-1 text-muted-foreground">View and manage form submissions</p>
      </div>

      <SubmissionFilters departments={departments} formLinks={formLinks} />

      <Card>
        <CardHeader>
          <CardTitle>All Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionList submissions={submissions} />
        </CardContent>
      </Card>
    </div>
  )
}
