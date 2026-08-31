export type ApiErrorBody = { code: string; message: string; details?: unknown }

export class ApiError extends Error {
  code: string
  status: number
  details?: unknown

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = "ApiError"
    this.code = body.code
    this.status = status
    this.details = body.details
  }
}

type RequestOptions = {
  // Anexa um Idempotency-Key novo — use nos POSTs financeiros.
  idempotent?: boolean
  signal?: AbortSignal
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.assign("/login")
    }
    throw new ApiError(401, { code: "UNAUTHENTICATED", message: "Sessão expirada, faça login novamente." })
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, data ?? { code: "UNKNOWN_ERROR", message: "Erro inesperado." })
  }

  return data as T
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers()
  if (body !== undefined) {
    headers.set("Content-Type", "application/json")
  }
  if (options.idempotent) {
    headers.set("Idempotency-Key", crypto.randomUUID())
  }

  const response = await fetch(`/api/proxy${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
    credentials: "same-origin",
  })

  return handleResponse<T>(response)
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, undefined, options),
}
