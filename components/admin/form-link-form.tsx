"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Department {
  id: number
  name: string
}

export function FormLinkForm({ departments }: { departments: Department[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const expiresAt = formData.get("expiresAt") as string

    const data = {
      departmentId: Number.parseInt(formData.get("departmentId") as string),
      title: (formData.get("title") as string) || null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    }

    try {
      const response = await fetch("/api/form-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create")

      toast.success("Form link created successfully")
      router.push("/admin/form-links")
      router.refresh()
    } catch {
      toast.error("Failed to create form link")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department</Label>
            <Select name="departmentId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input id="title" name="title" placeholder="e.g., Q4 2024 Responsibilities" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires At (Optional)</Label>
            <Input id="expiresAt" name="expiresAt" type="datetime-local" />
            <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Link
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
