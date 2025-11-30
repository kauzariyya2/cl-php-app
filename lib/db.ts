// Database connection using Neon PostgreSQL serverless driver
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function query<T>(sqlQuery: string, params?: unknown[]): Promise<T> {
  const result = await sql(sqlQuery, params as any[])
  return result as T
}

export async function queryOne<T>(sqlQuery: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T[]>(sqlQuery, params)
  return rows[0] ?? null
}

export { sql }
