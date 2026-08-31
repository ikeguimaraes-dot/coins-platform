import type { NextResponse } from "next/server"

import type { TokenPair } from "@/lib/api/platform-auth"

export const ACCESS_TOKEN_COOKIE = "coins_platform_at"
export const REFRESH_TOKEN_COOKIE = "coins_platform_rt"
// Guarda o mfaChallengeToken devolvido por /platform/auth/login enquanto o fluxo de MFA não termina.
export const PENDING_TOKEN_COOKIE = "coins_platform_pending"

const isProduction = process.env.NODE_ENV === "production"

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
}

const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30
const PENDING_TOKEN_MAX_AGE = 60 * 5

export function setSessionCookies(response: NextResponse, tokens: TokenPair) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: tokens.expiresIn,
  })
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...baseCookieOptions, maxAge: 0 })
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...baseCookieOptions, maxAge: 0 })
}

export function setPendingCookie(response: NextResponse, mfaChallengeToken: string) {
  response.cookies.set(PENDING_TOKEN_COOKIE, mfaChallengeToken, {
    ...baseCookieOptions,
    maxAge: PENDING_TOKEN_MAX_AGE,
  })
}

export function clearPendingCookie(response: NextResponse) {
  response.cookies.set(PENDING_TOKEN_COOKIE, "", { ...baseCookieOptions, maxAge: 0 })
}
