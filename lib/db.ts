// Database connection using Neon PostgreSQL serverless driver
import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export async function query<T>(sqlQuery: string, params?: unknown[]): Promise<T> {
  const rows = await sql(sqlQuery, params as any[])
  return rows as T
}

export async function queryOne<T>(sqlQuery: string, params?: unknown[]): Promise<T | null> {
  const rows = await sql(sqlQuery, params as any[])
  return first(rows) as T | null
}

// Helper to get single row from query result
export function first<T>(rows: T[]): T | null {
  return rows[0] ?? null
}
