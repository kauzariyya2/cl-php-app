"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Edit, MoreHorizontal, Trash2, Filter } from "lucide-react"
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

interface Question {
  id: number
  departmentId: number
  departmentName: string
  questionText: string
  type: string
  options: string[] | null
  required: boolean
  sortOrder: number
}

interface Department {
  id: number
  name: string
}

const typeLabels: Record<string, string> = {
  text: "Text",
  textarea: "Textarea",
  number: "Number",
  date: "Date",
  select: "Select",
}

export function QuestionList({
  questions,
  departments,
}: {
  questions: Question[]
  departments: Department[]
}) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState<string>("all")

  const filteredQuestions =
    filterDepartment === "all"
      ? questions
      : questions.filter((q) => q.departmentId === Number.parseInt(filterDepartment))

  async function handleDelete() {
    if (!deleteId) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/questions/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast.success("Question deleted successfully")
      router.refresh()
    } catch {
      toast.error("Failed to delete question")
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

      {filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No questions found</p>
            <Link href="/admin/questions/new" className="mt-4">
              <Button variant="outline">Add Question</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-md">
                    <p className="truncate">{question.questionText}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{question.departmentName}</Badge>
                  </TableCell>
                  <TableCell>{typeLabels[question.type] || question.type}</TableCell>
                  <TableCell>
                    {question.required ? <Badge>Required</Badge> : <Badge variant="outline">Optional</Badge>}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/questions/${question.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(question.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question. This action cannot be undone.
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
