"use client"

import * as React from "react"
import { ImageOff } from "lucide-react"

type OfferImageProps = {
  src?: string | null
  alt: string
  size?: "thumb" | "large"
}

export function OfferImage({ src, alt, size = "thumb" }: OfferImageProps) {
  const [errored, setErrored] = React.useState(false)

  React.useEffect(() => {
    setErrored(false)
  }, [src])

  const showImage = Boolean(src) && !errored
  const containerClass =
    size === "large"
      ? "aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted/40"
      : "h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted/40"

  return (
    <div className={containerClass}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL externa arbitrária colada pelo admin, não passa pelo otimizador
        <img
          src={src ?? undefined}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <ImageOff className={size === "large" ? "h-8 w-8" : "h-5 w-5"} />
        </div>
      )}
    </div>
  )
}
