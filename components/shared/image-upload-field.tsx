"use client"

import * as React from "react"
import { ImagePlus, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EntityImage } from "@/components/shared/entity-image"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE = 4 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

type ImageUploadFieldProps = {
  label: string
  value?: string | null
  onChange: (url: string | null) => void
  pathPrefix: "offers" | "courses" | "lessons"
  onUploadingChange?: (uploading: boolean) => void
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "processing" }
  | { status: "error"; message: string; file: File }

function uploadImage(
  file: File,
  pathPrefix: ImageUploadFieldProps["pathPrefix"],
  onProgress: (progress: number) => void
) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/uploads/images")
    xhr.setRequestHeader("Content-Type", file.type)
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name))
    xhr.setRequestHeader("X-Upload-Prefix", pathPrefix)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    xhr.onerror = () => reject(new Error("Falha de rede durante o upload."))
    xhr.onload = () => {
      const body = (() => {
        try {
          return JSON.parse(xhr.responseText) as { url?: string; message?: string }
        } catch {
          return null
        }
      })()

      if (xhr.status >= 200 && xhr.status < 300 && body?.url) {
        resolve(body.url)
        return
      }
      reject(new Error(body?.message ?? "Não foi possível enviar a imagem."))
    }
    xhr.send(file)
  })
}

export function ImageUploadField({
  label,
  value,
  onChange,
  pathPrefix,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const inputId = React.useId()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const previewUrlRef = React.useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [uploadState, setUploadState] = React.useState<UploadState>({ status: "idle" })

  React.useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  function clearLocalPreview() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setPreviewUrl(null)
  }

  async function startUpload(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadState({ status: "error", message: "Use uma imagem JPEG, PNG, WebP ou AVIF.", file })
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadState({ status: "error", message: "A imagem deve ter no máximo 4 MB.", file })
      return
    }

    clearLocalPreview()
    const localUrl = URL.createObjectURL(file)
    previewUrlRef.current = localUrl
    setPreviewUrl(localUrl)
    setUploadState({ status: "uploading", progress: 0 })
    onUploadingChange?.(true)

    try {
      const url = await uploadImage(file, pathPrefix, (progress) => {
        setUploadState(progress === 100 ? { status: "processing" } : { status: "uploading", progress })
      })
      onChange(url)
      clearLocalPreview()
      setUploadState({ status: "idle" })
    } catch (error) {
      clearLocalPreview()
      setUploadState({
        status: "error",
        message: error instanceof Error ? error.message : "Não foi possível enviar a imagem.",
        file,
      })
    } finally {
      onUploadingChange?.(false)
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) void startUpload(file)
  }

  function removeImage() {
    clearLocalPreview()
    setUploadState({ status: "idle" })
    if (fileInputRef.current) fileInputRef.current.value = ""
    onChange(null)
  }

  const isUploading = uploadState.status === "uploading" || uploadState.status === "processing"
  const shownImage = previewUrl ?? value ?? null

  return (
    <div className="grid gap-2">
      <label className="text-[12px] font-semibold text-muted-foreground" htmlFor={`${inputId}-url`}>
        {label}
      </label>

      <label
        htmlFor={`${inputId}-file`}
        className={cn(
          "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-input hover:bg-muted/40",
          isUploading && "pointer-events-none opacity-70"
        )}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
      >
        <ImagePlus className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm font-medium">Arraste uma imagem ou clique para escolher</span>
        <span className="text-xs text-muted-foreground">JPEG, PNG, WebP ou AVIF · máximo 4 MB</span>
      </label>
      <input
        ref={fileInputRef}
        id={`${inputId}-file`}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        disabled={isUploading}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {uploadState.status === "uploading" ? (
        <div className="grid gap-1" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width]" style={{ width: `${uploadState.progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">Enviando imagem… {uploadState.progress}%</p>
        </div>
      ) : null}
      {uploadState.status === "processing" ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Processando imagem…
        </p>
      ) : null}
      {uploadState.status === "error" ? (
        <div className="flex flex-wrap items-center gap-2" role="alert">
          <p className="text-sm text-destructive">{uploadState.message}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void startUpload(uploadState.file)}>
            <RotateCcw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Input
          id={`${inputId}-url`}
          type="url"
          value={value ?? ""}
          placeholder="Ou cole uma URL https://..."
          disabled={isUploading}
          onChange={(event) => {
            clearLocalPreview()
            setUploadState({ status: "idle" })
            onChange(event.target.value || null)
          }}
        />
        {shownImage ? (
          <Button type="button" variant="outline" onClick={removeImage} disabled={isUploading}>
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        ) : null}
      </div>

      {shownImage ? (
        <div className="max-w-xs">
          <EntityImage src={shownImage} alt={`Preview de ${label.toLowerCase()}`} size="large" />
        </div>
      ) : null}
    </div>
  )
}
