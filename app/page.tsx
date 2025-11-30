import type React from "react"
import Link from "next/link"
import { Building2, ClipboardList, Link2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">EduPortal</span>
          </div>
          <Link href="/admin/login">
            <Button>Admin Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Educational Department
            <br />
            <span className="text-primary">Responsibility Portal</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Streamline your institution's department management. Create departments, define responsibility questions,
            and collect teacher submissions effortlessly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/admin/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={Building2}
            title="Department Management"
            description="Create and organize departments with custom descriptions and settings."
          />
          <FeatureCard
            icon={ClipboardList}
            title="Dynamic Questions"
            description="Build custom questionnaires with various field types for each department."
          />
          <FeatureCard
            icon={Link2}
            title="Unique Form Links"
            description="Generate secure, token-based links for teachers to submit responses."
          />
          <FeatureCard
            icon={Users}
            title="Submission Tracking"
            description="View, filter, and export submissions with comprehensive reporting."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-24">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">Educational Department Responsibility Portal</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
