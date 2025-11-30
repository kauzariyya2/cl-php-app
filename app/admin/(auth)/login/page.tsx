import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/admin/login-form"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to access the admin dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
