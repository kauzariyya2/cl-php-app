import Link from "next/link"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { QuestionList } from "@/components/admin/question-list"

interface Question {
  id: number
  questionText: string
  type: string
  required: boolean
  sortOrder: number
  departmentId: number
  departmentName: string
}

async function getQuestions(): Promise<Question[]> {
  const questions = await sql`
    SELECT 
      q.id,
      q."questionText",
      q.type,
      q.required,
      q."sortOrder",
      q."departmentId",
      d.name as "departmentName"
    FROM "Question" q
    JOIN "Department" d ON d.id = q."departmentId"
    ORDER BY d.name, q."sortOrder"
  `
  return questions as Question[]
}

export default async function QuestionsPage() {
  const questions = await getQuestions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Questions</h1>
          <p className="mt-1 text-muted-foreground">Manage responsibility questions</p>
        </div>
        <Link href="/admin/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Question
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionList questions={questions} />
        </CardContent>
      </Card>
    </div>
  )
}
