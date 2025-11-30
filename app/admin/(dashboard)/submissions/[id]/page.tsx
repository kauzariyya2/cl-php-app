import { notFound } from "next/navigation"
import Link from "next/link"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Mail, User } from "lucide-react"

interface Submission {
  id: number
  name: string | null
  email: string | null
  ipAddress: string | null
  submittedAt: Date
  departmentName: string
  formLinkTitle: string | null
}

interface Answer {
  id: number
  answers: Record<string, string>
}

interface Question {
  id: number
  questionText: string
  type: string
}

async function getSubmission(id: number): Promise<Submission | null> {
  const [submission] = await sql`
    SELECT 
      s.id,
      s.name,
      s.email,
      s."ipAddress",
      s."submittedAt",
      d.name as "departmentName",
      fl.title as "formLinkTitle"
    FROM "Submission" s
    JOIN "FormLink" fl ON fl.id = s."formLinkId"
    JOIN "Department" d ON d.id = fl."departmentId"
    WHERE s.id = ${id}
  `
  return submission as Submission | null
}

async function getAnswers(submissionId: number): Promise<Answer[]> {
  const answers = await sql`
    SELECT id, answers FROM "SubmissionAnswer" WHERE "submissionId" = ${submissionId}
  `
  return answers as Answer[]
}

async function getQuestions(submissionId: number): Promise<Question[]> {
  const questions = await sql`
    SELECT DISTINCT q.id, q."questionText", q.type
    FROM "Question" q
    JOIN "FormLink" fl ON fl."departmentId" = q."departmentId"
    JOIN "Submission" s ON s."formLinkId" = fl.id
    WHERE s.id = ${submissionId}
    ORDER BY q."sortOrder"
  `
  return questions as Question[]
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const submission = await getSubmission(Number.parseInt(id))

  if (!submission) {
    notFound()
  }

  const [answers, questions] = await Promise.all([getAnswers(submission.id), getQuestions(submission.id)])

  const answerMap = answers.reduce((acc, a) => ({ ...acc, ...a.answers }), {} as Record<string, string>)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/submissions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Submission Details</h1>
          <p className="mt-1 text-muted-foreground">View submission #{submission.id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Submission Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{submission.name || "Anonymous"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{submission.email || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Submitted:</span>
              <span className="font-medium">{new Date(submission.submittedAt).toLocaleString()}</span>
            </div>
            <div className="pt-2">
              <Badge variant="secondary">{submission.departmentName}</Badge>
              {submission.formLinkTitle && (
                <Badge variant="outline" className="ml-2">
                  {submission.formLinkTitle}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border-b pb-4 last:border-0">
                  <p className="text-sm font-medium text-muted-foreground">{question.questionText}</p>
                  <p className="mt-1 text-foreground">
                    {answerMap[question.id.toString()] || (
                      <span className="italic text-muted-foreground">No answer</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
