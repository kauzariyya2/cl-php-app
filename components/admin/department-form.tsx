"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Department {
  id: number
  name: string
  description: string | null
}

export function DepartmentForm({ department }: { department?: Department }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    }

    try {
      const url = department ? `/api/departments/${department.id}` : "/api/departments"
      const method = department ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }

      toast.success(department ? "Department updated" : "Department created")
      router.push("/admin/departments")
      router.refresh()
    } catch {
      toast.error("Failed to save department")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={department?.name}
              placeholder="e.g., Science Department"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={department?.description ?? ""}
              placeholder="Brief description of the department"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {department ? "Update" : "Create"} Department
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
