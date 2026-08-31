import { COINS_API_URL } from "@/lib/api/config"
import type { TokenPair } from "@/lib/api/platform-auth"

export async function refreshSession(refreshToken: string): Promise<TokenPair | null> {
  const response = await fetch(`${COINS_API_URL}/platform/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as TokenPair
}
