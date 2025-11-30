import { randomBytes } from "crypto"

export function generateToken(length = 48): string {
  return randomBytes(length).toString("hex").slice(0, length)
}
