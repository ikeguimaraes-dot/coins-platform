import { NextResponse } from "next/server"

import { COINS_API_URL } from "@/lib/api/config"
import { loginStepFromStatus, type PlatformLoginResponse } from "@/lib/api/platform-auth"
import { setPendingCookie } from "@/lib/auth/cookies"

export async function POST(request: Request) {
  const body = await request.json()

  const upstream = await fetch(`${COINS_API_URL}/platform/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const data = await upstream.json().catch(() => null)

  if (!upstream.ok) {
    return NextResponse.json(
      data ?? { code: "UNKNOWN_ERROR", message: "Não foi possível autenticar." },
      { status: upstream.status }
    )
  }

  const loginResponse = data as PlatformLoginResponse
  const response = NextResponse.json({ step: loginStepFromStatus(loginResponse.status) })
  setPendingCookie(response, loginResponse.mfaChallengeToken)
  return response
}
