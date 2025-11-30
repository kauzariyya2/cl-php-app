"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Copy, ExternalLink, Filter, MoreHorizontal, Trash2, FileText } from "lucide-react"
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

interface FormLink {
  id: number
  departmentId: number
  departmentName: string
  token: string
  title: string | null
  expiresAt: Date | null
  submissionCount: number
  createdAt: Date
}

interface Department {
  id: number
  name: string
}

export function FormLinkList({
  formLinks,
  departments,
}: {
  formLinks: FormLink[]
  departments: Department[]
}) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState<string>("all")

  const filteredLinks =
    filterDepartment === "all"
      ? formLinks
      : formLinks.filter((l) => l.departmentId === Number.parseInt(filterDepartment))

  function isExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/submit/${token}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  async function handleDelete() {
    if (!deleteId) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/form-links/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast.success("Form link deleted successfully")
      router.refresh()
    } catch {
      toast.error("Failed to delete form link")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (departments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Create a department first</p>
          <Link href="/admin/departments/new" className="mt-4">
            <Button variant="outline">Create Department</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredLinks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No form links found</p>
            <Link href="/admin/form-links/new" className="mt-4">
              <Button variant="outline">Create Form Link</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title / Token</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{link.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{link.token.slice(0, 12)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{link.departmentName}</Badge>
                  </TableCell>
                  <TableCell>
                    {isExpired(link.expiresAt) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {link.submissionCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(link.token)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Link href={`/submit/${link.token}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(link.id)}
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
            <AlertDialogTitle>Delete Form Link</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this form link and all its submissions. This action cannot be undone.
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
