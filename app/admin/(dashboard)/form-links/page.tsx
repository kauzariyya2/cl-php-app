import Link from "next/link"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { FormLinkList } from "@/components/admin/form-link-list"

interface FormLink {
  id: number
  token: string
  title: string | null
  expiresAt: Date | null
  createdAt: Date
  departmentId: number
  departmentName: string
  submissionCount: number
}

async function getFormLinks(): Promise<FormLink[]> {
  const formLinks = await sql`
    SELECT 
      fl.id,
      fl.token,
      fl.title,
      fl."expiresAt",
      fl."createdAt",
      fl."departmentId",
      d.name as "departmentName",
      COUNT(s.id) as "submissionCount"
    FROM "FormLink" fl
    JOIN "Department" d ON d.id = fl."departmentId"
    LEFT JOIN "Submission" s ON s."formLinkId" = fl.id
    GROUP BY fl.id, d.name
    ORDER BY fl."createdAt" DESC
  `
  return formLinks as FormLink[]
}

export default async function FormLinksPage() {
  const formLinks = await getFormLinks()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Form Links</h1>
          <p className="mt-1 text-muted-foreground">Manage submission form links</p>
        </div>
        <Link href="/admin/form-links/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Form Link
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Form Links</CardTitle>
        </CardHeader>
        <CardContent>
          <FormLinkList formLinks={formLinks} />
        </CardContent>
      </Card>
    </div>
  )
}
