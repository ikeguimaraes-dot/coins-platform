import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { COINS_API_URL } from "@/lib/api/config"
import { PENDING_TOKEN_COOKIE } from "@/lib/auth/cookies"

export async function POST() {
  const pendingToken = cookies().get(PENDING_TOKEN_COOKIE)?.value
  if (!pendingToken) {
    return NextResponse.json(
      { code: "MFA_SESSION_EXPIRED", message: "Sessão de login expirada, faça login novamente." },
      { status: 401 }
    )
  }

  const upstream = await fetch(`${COINS_API_URL}/platform/auth/mfa/setup`, {
    method: "POST",
    headers: { Authorization: `Bearer ${pendingToken}` },
    cache: "no-store",
  })

  const data = await upstream.json().catch(() => null)
  return NextResponse.json(data, { status: upstream.status })
}
