import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DepartmentForm } from "@/components/admin/department-form"

interface Department {
  id: number
  name: string
  description: string | null
}

async function getDepartment(id: number): Promise<Department | null> {
  const [department] = await sql`
    SELECT id, name, description FROM "Department" WHERE id = ${id}
  `
  return department as Department | null
}

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const department = await getDepartment(Number.parseInt(id))

  if (!department) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Department</h1>
        <p className="mt-1 text-muted-foreground">Update department details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentForm department={department} />
        </CardContent>
      </Card>
    </div>
  )
}
