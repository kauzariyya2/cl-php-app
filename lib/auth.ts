import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { sql } from "./db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface User {
  id: number
  email: string
  name: string | null
  role: string
}

export interface SessionPayload {
  userId: number
  email: string
  role: string
  expiresAt: Date
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"])

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derivedKey = await deriveKey(password, salt)
  const saltBase64 = arrayBufferToBase64(salt)
  const hashBase64 = arrayBufferToBase64(derivedKey)
  return `${saltBase64}:${hashBase64}`
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const [saltBase64, hashBase64] = hashedPassword.split(":")
    if (!saltBase64 || !hashBase64) return false

    const salt = base64ToArrayBuffer(saltBase64)
    const derivedKey = await deriveKey(password, salt)
    const newHashBase64 = arrayBufferToBase64(derivedKey)

    return hashBase64 === newHashBase64
  } catch {
    return false
  }
}

export async function createSession(user: User): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null

  const [user] = await sql`
    SELECT id, email, name, role FROM "User" WHERE id = ${session.userId}
  `

  return user as User | null
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
