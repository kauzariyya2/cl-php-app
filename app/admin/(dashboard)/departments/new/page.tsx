import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DepartmentForm } from "@/components/admin/department-form"

export default function NewDepartmentPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Department</h1>
        <p className="mt-1 text-muted-foreground">Add a new department to your organization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentForm />
        </CardContent>
      </Card>
    </div>
  )
}
