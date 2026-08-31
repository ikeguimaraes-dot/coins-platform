import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { COINS_API_URL } from "@/lib/api/config"
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionCookies,
  setSessionCookies,
} from "@/lib/auth/cookies"
import { refreshSession } from "@/lib/auth/refresh"

// Headers que não devem ser repassados 1:1 pro upstream (o fetch monta os seus).
const HOP_BY_HOP_REQUEST_HEADERS = new Set(["host", "cookie", "content-length", "connection"])

type RouteContext = { params: { path: string[] } }

async function readBody(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined
  }
  return request.arrayBuffer()
}

function buildForwardHeaders(request: Request, accessToken: string | undefined) {
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }
  return headers
}

async function forward(
  request: Request,
  path: string[],
  body: ArrayBuffer | undefined,
  accessToken: string | undefined
) {
  const url = new URL(request.url)
  const target = `${COINS_API_URL}/${path.join("/")}${url.search}`

  return fetch(target, {
    method: request.method,
    headers: buildForwardHeaders(request, accessToken),
    body,
    cache: "no-store",
  })
}

function passthroughResponse(upstream: Response) {
  const headers = new Headers()
  const contentType = upstream.headers.get("content-type")
  if (contentType) {
    headers.set("content-type", contentType)
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers })
}

async function handle(request: Request, { params }: RouteContext) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const body = await readBody(request)

  let upstream = await forward(request, params.path, body, accessToken)

  if (upstream.status === 401) {
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
    const newTokens = refreshToken ? await refreshSession(refreshToken) : null

    if (!newTokens) {
      const response = passthroughResponse(upstream)
      clearSessionCookies(response)
      return response
    }

    upstream = await forward(request, params.path, body, newTokens.accessToken)
    const response = passthroughResponse(upstream)
    setSessionCookies(response, newTokens)
    return response
  }

  return passthroughResponse(upstream)
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE }
