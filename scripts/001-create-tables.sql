-- Educational Department Responsibility Portal
-- PostgreSQL (Neon) Database Schema

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS "User" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(191) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(191),
  "role" VARCHAR(50) NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS "Department" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(191) NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS "Question" (
  "id" SERIAL PRIMARY KEY,
  "departmentId" INT NOT NULL,
  "questionText" TEXT NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "options" JSONB,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Question_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Question_departmentId_idx" ON "Question"("departmentId");

-- Form Links table
CREATE TABLE IF NOT EXISTS "FormLink" (
  "id" SERIAL PRIMARY KEY,
  "departmentId" INT NOT NULL,
  "token" VARCHAR(64) NOT NULL UNIQUE,
  "title" VARCHAR(191),
  "expiresAt" TIMESTAMP(3),
  "createdById" INT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FormLink_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FormLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "FormLink_departmentId_idx" ON "FormLink"("departmentId");
CREATE INDEX IF NOT EXISTS "FormLink_token_idx" ON "FormLink"("token");

-- Submissions table
CREATE TABLE IF NOT EXISTS "Submission" (
  "id" SERIAL PRIMARY KEY,
  "formLinkId" INT NOT NULL,
  "name" VARCHAR(191),
  "email" VARCHAR(191),
  "ipAddress" VARCHAR(45),
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Submission_formLinkId_fkey" FOREIGN KEY ("formLinkId") REFERENCES "FormLink"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Submission_formLinkId_idx" ON "Submission"("formLinkId");

-- Submission Answers table
CREATE TABLE IF NOT EXISTS "SubmissionAnswer" (
  "id" SERIAL PRIMARY KEY,
  "submissionId" INT NOT NULL,
  "questionId" INT NOT NULL,
  "answer" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubmissionAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SubmissionAnswer_submissionId_idx" ON "SubmissionAnswer"("submissionId");
