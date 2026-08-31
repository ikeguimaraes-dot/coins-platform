import { cookies } from "next/headers"

import { serverFetchJson } from "@/lib/api/server-fetch"
import type { PlatformAdminProfile } from "@/lib/api/platform-auth"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"

export function hasSessionCookie() {
  return Boolean(cookies().get(ACCESS_TOKEN_COOKIE)?.value)
}

export async function getCurrentPlatformAdmin() {
  return serverFetchJson<PlatformAdminProfile>("/platform/auth/me")
}
