import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { COINS_API_URL } from "@/lib/api/config"
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearPendingCookie,
  clearSessionCookies,
} from "@/lib/auth/cookies"

export async function POST() {
  const accessToken = cookies().get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = cookies().get(REFRESH_TOKEN_COOKIE)?.value

  if (accessToken && refreshToken) {
    await fetch(`${COINS_API_URL}/platform/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => null)
  }

  const response = NextResponse.json({ step: "ok" })
  clearSessionCookies(response)
  clearPendingCookie(response)
  return response
}
