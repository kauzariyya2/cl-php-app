import { notFound } from "next/navigation"
import { queryOne, query } from "@/lib/db"
import { SubmissionForm } from "@/components/submit/submission-form"

interface FormLink {
  id: number
  departmentId: number
  departmentName: string
  token: string
  title: string | null
  expiresAt: Date | null
}

interface Question {
  id: number
  questionText: string
  type: string
  options: string[] | null
  required: boolean
  sortOrder: number
}

async function getFormLink(token: string) {
  try {
    return await queryOne<FormLink>(
      `SELECT 
        fl.id,
        fl."departmentId",
        d.name as "departmentName",
        fl.token,
        fl.title,
        fl."expiresAt"
      FROM "FormLink" fl
      JOIN "Department" d ON fl."departmentId" = d.id
      WHERE fl.token = $1`,
      [token],
    )
  } catch {
    return null
  }
}

async function getQuestions(departmentId: number) {
  try {
    return await query<Question[]>(
      `SELECT id, "questionText", type, options, required, "sortOrder" 
       FROM "Question" 
       WHERE "departmentId" = $1 
       ORDER BY "sortOrder", "createdAt"`,
      [departmentId],
    )
  } catch {
    return []
  }
}

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const formLink = await getFormLink(token)

  if (!formLink) {
    notFound()
  }

  // Check if expired
  if (formLink.expiresAt && new Date(formLink.expiresAt) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Link Expired</h1>
          <p className="mt-2 text-muted-foreground">
            This submission link has expired. Please contact the administrator.
          </p>
        </div>
      </div>
    )
  }

  const questions = await getQuestions(formLink.departmentId)

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">No Questions</h1>
          <p className="mt-2 text-muted-foreground">No questions have been added for this department yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">{formLink.title || "Responsibility Report"}</h1>
          <p className="mt-2 text-muted-foreground">{formLink.departmentName}</p>
        </div>

        <SubmissionForm formLinkId={formLink.id} token={token} questions={questions} />
      </div>
    </div>
  )
}
