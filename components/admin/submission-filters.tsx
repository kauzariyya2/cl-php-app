"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Filter, X } from "lucide-react"

interface Department {
  id: number
  name: string
}

interface FormLink {
  id: number
  title: string | null
  token: string
}

interface SubmissionFiltersProps {
  departments: Department[]
  formLinks: FormLink[]
}

export function SubmissionFilters({ departments, formLinks }: SubmissionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentDepartmentId = searchParams.get("departmentId") || ""
  const currentFormLinkId = searchParams.get("formLinkId") || ""
  const currentStartDate = searchParams.get("startDate") || ""
  const currentEndDate = searchParams.get("endDate") || ""

  const hasFilters = currentDepartmentId || currentFormLinkId || currentStartDate || currentEndDate

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/submissions?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/admin/submissions")
  }

  const handleExport = async () => {
    const params = new URLSearchParams(searchParams.toString())
    const response = await fetch(`/api/submissions/export?${params.toString()}`)
    if (response.ok) {
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `submissions-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filters</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm text-muted-foreground">
            Department
          </Label>
          <select
            id="department"
            value={currentDepartmentId}
            onChange={(e) => updateFilters("departmentId", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="formLink" className="text-sm text-muted-foreground">
            Form Link
          </Label>
          <select
            id="formLink"
            value={currentFormLinkId}
            onChange={(e) => updateFilters("formLinkId", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Forms</option>
            {formLinks.map((link) => (
              <option key={link.id} value={link.id}>
                {link.title || `Form ${link.token.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm text-muted-foreground">
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={currentStartDate}
            onChange={(e) => updateFilters("startDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm text-muted-foreground">
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={currentEndDate}
            onChange={(e) => updateFilters("endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  )
}
