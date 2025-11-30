"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Question {
  id: number
  departmentId: number
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

const questionTypes = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown Select" },
]

export function QuestionForm({
  question,
  departments,
}: {
  question?: Question
  departments: Department[]
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState(question?.type || "text")
  const [options, setOptions] = useState<string[]>(question?.options || [""])
  const [required, setRequired] = useState(question?.required ?? true)

  function addOption() {
    setOptions([...options, ""])
  }

  function removeOption(index: number) {
    setOptions(options.filter((_, i) => i !== index))
  }

  function updateOption(index: number, value: string) {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      departmentId: Number.parseInt(formData.get("departmentId") as string),
      questionText: formData.get("questionText") as string,
      type,
      options: type === "select" ? options.filter((o) => o.trim()) : null,
      required,
      sortOrder: Number.parseInt(formData.get("sortOrder") as string) || 0,
    }

    try {
      const url = question ? `/api/questions/${question.id}` : "/api/questions"
      const method = question ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast.success(question ? "Question updated" : "Question created")
      router.push("/admin/questions")
      router.refresh()
    } catch {
      toast.error("Failed to save question")
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
            <Select name="departmentId" defaultValue={question?.departmentId?.toString()} required>
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
            <Label htmlFor="questionText">Question</Label>
            <Textarea
              id="questionText"
              name="questionText"
              defaultValue={question?.questionText}
              placeholder="Enter your question"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "select" && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={question?.sortOrder ?? 0} min={0} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="required">Required</Label>
            <Switch id="required" checked={required} onCheckedChange={setRequired} />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {question ? "Update" : "Create"} Question
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
