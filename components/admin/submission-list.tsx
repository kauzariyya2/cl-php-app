"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Mail, User } from "lucide-react"

interface Submission {
  id: number
  name: string | null
  email: string | null
  submittedAt: Date
  departmentName: string
  formLinkTitle: string | null
}

interface SubmissionListProps {
  submissions: Submission[]
}

export function SubmissionList({ submissions }: SubmissionListProps) {
  if (submissions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No submissions found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Submitted By</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Form</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {submissions.map((submission) => (
            <tr key={submission.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {submission.name || "Anonymous"}
                  </div>
                  {submission.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {submission.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {submission.departmentName}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{submission.formLinkTitle || "Untitled Form"}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/submissions/${submission.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
