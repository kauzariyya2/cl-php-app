import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionForm } from "@/components/admin/question-form"

interface Department {
  id: number
  name: string
}

async function getDepartments(): Promise<Department[]> {
  const departments = await sql`SELECT id, name FROM "Department" ORDER BY name`
  return departments as Department[]
}

export default async function NewQuestionPage() {
  const departments = await getDepartments()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Question</h1>
        <p className="mt-1 text-muted-foreground">Add a new responsibility question</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm departments={departments} />
        </CardContent>
      </Card>
    </div>
  )
}
