import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

import { getCurrentPlatformAdmin } from "@/lib/auth/session"

const MAX_FILE_SIZE = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])
const ALLOWED_PREFIXES = new Set(["offers", "courses", "lessons"])

function hasValidSignature(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }
  if (contentType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    )
  }
  if (contentType === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    )
  }
  if (contentType === "image/avif") {
    const hasFtyp = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
    const hasAvifBrand =
      bytes[8] === 0x61 &&
      bytes[9] === 0x76 &&
      bytes[10] === 0x69 &&
      (bytes[11] === 0x66 || bytes[11] === 0x73)
    return hasFtyp && hasAvifBrand
  }
  return false
}

function safeFilename(filename: string) {
  const normalized = filename.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-")
  return normalized.replace(/^-+|-+$/g, "") || "image"
}

function decodeFilename(value: string | null) {
  if (!value) return "image"
  try {
    return decodeURIComponent(value)
  } catch {
    return "image"
  }
}

export async function POST(request: Request) {
  const admin = await getCurrentPlatformAdmin()
  if (!admin) {
    return NextResponse.json({ message: "Sessão expirada, faça login novamente." }, { status: 401 })
  }

  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? ""
  const filename = decodeFilename(request.headers.get("x-file-name"))
  const prefix = request.headers.get("x-upload-prefix") ?? ""
  const contentLength = Number(request.headers.get("content-length") ?? 0)

  if (!ALLOWED_PREFIXES.has(prefix)) {
    return NextResponse.json({ message: "Destino de upload inválido." }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ message: "Use uma imagem JPEG, PNG, WebP ou AVIF." }, { status: 415 })
  }
  if (contentLength > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "A imagem deve ter no máximo 4 MB." }, { status: 413 })
  }

  const body = new Uint8Array(await request.arrayBuffer())
  if (body.byteLength === 0) {
    return NextResponse.json({ message: "Selecione uma imagem para enviar." }, { status: 400 })
  }
  if (body.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "A imagem deve ter no máximo 4 MB." }, { status: 413 })
  }
  if (!hasValidSignature(body, contentType)) {
    return NextResponse.json({ message: "O conteúdo do arquivo não corresponde a uma imagem válida." }, { status: 415 })
  }

  try {
    const blob = await put(`${prefix}/${safeFilename(filename)}`, Buffer.from(body), {
      access: "public",
      addRandomSuffix: true,
      contentType,
    })

    return NextResponse.json({ url: blob.url })
  } catch {
    return NextResponse.json({ message: "Não foi possível enviar a imagem. Tente novamente." }, { status: 502 })
  }
}
