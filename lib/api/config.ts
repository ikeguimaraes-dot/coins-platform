// Só deve ser importado em código server-only (route handlers, server components).
export const COINS_API_URL =
  process.env.COINS_API_URL ?? "https://mrcoin-api-onrender-com.onrender.com"
