import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionForm } from "@/components/admin/question-form"

interface Question {
  id: number
  questionText: string
  type: string
  options: string[] | null
  required: boolean
  sortOrder: number
  departmentId: number
}

interface Department {
  id: number
  name: string
}

async function getQuestion(id: number): Promise<Question | null> {
  const [question] = await sql`
    SELECT id, "questionText", type, options, required, "sortOrder", "departmentId"
    FROM "Question" WHERE id = ${id}
  `
  return question as Question | null
}

async function getDepartments(): Promise<Department[]> {
  const departments = await sql`SELECT id, name FROM "Department" ORDER BY name`
  return departments as Department[]
}

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [question, departments] = await Promise.all([getQuestion(Number.parseInt(id)), getDepartments()])

  if (!question) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Question</h1>
        <p className="mt-1 text-muted-foreground">Update question details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm question={question} departments={departments} />
        </CardContent>
      </Card>
    </div>
  )
}
