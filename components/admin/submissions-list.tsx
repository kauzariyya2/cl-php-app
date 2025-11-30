"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Download, Eye, Filter, MoreHorizontal, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Submission {
  id: number
  formLinkId: number
  formLinkTitle: string | null
  departmentName: string
  name: string | null
  email: string | null
  submittedAt: Date
}

interface Department {
  id: number
  name: string
}

interface FormLink {
  id: number
  title: string | null
  departmentName: string
}

export function SubmissionsList({
  submissions,
  departments,
  formLinks,
}: {
  submissions: Submission[]
  departments: Department[]
  formLinks: FormLink[]
}) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [filterFormLink, setFilterFormLink] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filteredSubmissions = submissions.filter((s) => {
    if (filterDepartment !== "all" && s.departmentName !== filterDepartment) {
      return false
    }
    if (filterFormLink !== "all" && s.formLinkId !== Number.parseInt(filterFormLink)) {
      return false
    }
    if (dateFrom && new Date(s.submittedAt) < new Date(dateFrom)) {
      return false
    }
    if (dateTo && new Date(s.submittedAt) > new Date(dateTo + "T23:59:59")) {
      return false
    }
    return true
  })

  async function handleDelete() {
    if (!deleteId) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/submissions/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast.success("Submission deleted successfully")
      router.refresh()
    } catch {
      toast.error("Failed to delete submission")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  async function exportCSV() {
    try {
      const params = new URLSearchParams()
      if (filterDepartment !== "all") params.set("department", filterDepartment)
      if (filterFormLink !== "all") params.set("formLinkId", filterFormLink)
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)

      const response = await fetch(`/api/submissions/export?${params}`)
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `submissions-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Export completed")
    } catch {
      toast.error("Failed to export submissions")
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterFormLink} onValueChange={setFilterFormLink}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Form Link" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Links</SelectItem>
            {formLinks.map((link) => (
              <SelectItem key={link.id} value={link.id.toString()}>
                {link.title || `Link #${link.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[140px]"
            placeholder="From"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[140px]"
            placeholder="To"
          />
        </div>

        <Button variant="outline" onClick={exportCSV} className="ml-auto bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No submissions found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitter</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Form Link</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.name || "Anonymous"}</p>
                      {submission.email && <p className="text-xs text-muted-foreground">{submission.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{submission.departmentName}</Badge>
                  </TableCell>
                  <TableCell>{submission.formLinkTitle || `Link #${submission.formLinkId}`}</TableCell>
                  <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/submissions/${submission.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/submissions/${submission.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(submission.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this submission and all its answers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
