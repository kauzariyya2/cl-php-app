import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormLinkForm } from "@/components/admin/form-link-form"

interface Department {
  id: number
  name: string
}

async function getDepartments(): Promise<Department[]> {
  const departments = await sql`SELECT id, name FROM "Department" ORDER BY name`
  return departments as Department[]
}

export default async function NewFormLinkPage() {
  const departments = await getDepartments()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Form Link</h1>
        <p className="mt-1 text-muted-foreground">Generate a new submission form link</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Link Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormLinkForm departments={departments} />
        </CardContent>
      </Card>
    </div>
  )
}
