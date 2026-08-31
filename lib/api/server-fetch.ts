import { cookies } from "next/headers"

import { COINS_API_URL } from "@/lib/api/config"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"

export type ApiError = { code: string; message: string; details?: unknown }

// Uso restrito a server components / route handlers — nunca importar em código de client.
export async function serverFetch(path: string, init: RequestInit = {}) {
  const accessToken = cookies().get(ACCESS_TOKEN_COOKIE)?.value

  const headers = new Headers(init.headers)
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  return fetch(`${COINS_API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })
}

export async function serverFetchJson<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const response = await serverFetch(path, init)
  if (!response.ok) {
    return null
  }
  return (await response.json()) as T
}
