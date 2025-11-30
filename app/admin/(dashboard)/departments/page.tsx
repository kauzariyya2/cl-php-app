import Link from "next/link"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DepartmentList } from "@/components/admin/department-list"

interface Department {
  id: number
  name: string
  description: string | null
  createdAt: Date
  questionCount: number
  linkCount: number
}

async function getDepartments(): Promise<Department[]> {
  const departments = await sql`
    SELECT 
      d.id,
      d.name,
      d.description,
      d."createdAt",
      COUNT(DISTINCT q.id) as "questionCount",
      COUNT(DISTINCT fl.id) as "linkCount"
    FROM "Department" d
    LEFT JOIN "Question" q ON q."departmentId" = d.id
    LEFT JOIN "FormLink" fl ON fl."departmentId" = d.id
    GROUP BY d.id
    ORDER BY d."createdAt" DESC
  `
  return departments as Department[]
}

export default async function DepartmentsPage() {
  const departments = await getDepartments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <p className="mt-1 text-muted-foreground">Manage your departments</p>
        </div>
        <Link href="/admin/departments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Department
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentList departments={departments} />
        </CardContent>
      </Card>
    </div>
  )
}
