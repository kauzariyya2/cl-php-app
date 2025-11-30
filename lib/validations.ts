import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(191, "Name is too long"),
  description: z.string().optional(),
})

export const questionSchema = z.object({
  departmentId: z.number().int().positive(),
  questionText: z.string().min(1, "Question text is required"),
  type: z.enum(["text", "textarea", "number", "date", "select"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const formLinkSchema = z.object({
  departmentId: z.number().int().positive(),
  title: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
})

export const submissionSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  answers: z.record(z.string(), z.unknown()),
})

export type LoginInput = z.infer<typeof loginSchema>
export type DepartmentInput = z.infer<typeof departmentSchema>
export type QuestionInput = z.infer<typeof questionSchema>
export type FormLinkInput = z.infer<typeof formLinkSchema>
export type SubmissionInput = z.infer<typeof submissionSchema>
