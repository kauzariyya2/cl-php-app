import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Form Not Found</h2>
        <p className="mt-2 text-muted-foreground">This submission link is invalid or has been removed.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
