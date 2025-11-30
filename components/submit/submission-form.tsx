"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Question {
  id: number
  questionText: string
  type: string
  options: string[] | null
  required: boolean
}

export function SubmissionForm({
  formLinkId,
  token,
  questions,
}: {
  formLinkId: number
  token: string
  questions: Question[]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  function updateAnswer(questionId: number, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      answers,
    }

    try {
      const response = await fetch(`/api/submit/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Submission failed")
      }

      setIsSubmitted(true)
      toast.success("Response submitted successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-success" />
          <h2 className="mt-4 text-xl font-semibold text-card-foreground">Thank You!</h2>
          <p className="mt-2 text-center text-muted-foreground">Your response has been submitted successfully.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-lg">Your Information (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" />
            </div>
          </div>

          <hr className="border-border" />

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label>
                  {index + 1}. {question.questionText}
                  {question.required && <span className="ml-1 text-destructive">*</span>}
                </Label>
                {renderInput(question, answers[question.id] || "", (value) => updateAnswer(question.id, value))}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Response"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function renderInput(question: Question, value: string, onChange: (value: string) => void) {
  switch (question.type) {
    case "textarea":
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer"
          rows={4}
          required={question.required}
        />
      )
    case "number":
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter a number"
          required={question.required}
        />
      )
    case "date":
      return <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} required={question.required} />
    case "select":
      return (
        <Select value={value} onValueChange={onChange} required={question.required}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {(question.options || []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer"
          required={question.required}
        />
      )
  }
}
