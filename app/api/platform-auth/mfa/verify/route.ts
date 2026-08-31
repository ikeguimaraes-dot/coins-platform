import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { COINS_API_URL } from "@/lib/api/config"
import type { TokenPair } from "@/lib/api/platform-auth"
import { PENDING_TOKEN_COOKIE, clearPendingCookie, setSessionCookies } from "@/lib/auth/cookies"

export async function POST(request: Request) {
  const pendingToken = cookies().get(PENDING_TOKEN_COOKIE)?.value
  if (!pendingToken) {
    return NextResponse.json(
      { code: "MFA_SESSION_EXPIRED", message: "Sessão de login expirada, faça login novamente." },
      { status: 401 }
    )
  }

  const body = await request.json()

  const upstream = await fetch(`${COINS_API_URL}/platform/auth/mfa/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pendingToken}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const data = await upstream.json().catch(() => null)

  if (!upstream.ok) {
    return NextResponse.json(
      data ?? { code: "UNKNOWN_ERROR", message: "Código inválido." },
      { status: upstream.status }
    )
  }

  const response = NextResponse.json({ step: "ok" })
  setSessionCookies(response, data as TokenPair)
  clearPendingCookie(response)
  return response
}
