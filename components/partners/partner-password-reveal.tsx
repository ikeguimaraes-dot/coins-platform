"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PartnerPasswordReveal({ password }: { password: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border bg-[#FFF1EA] p-4">
      <p className="mb-3 break-all font-mono text-[15px] font-semibold text-foreground">{password}</p>
      <Button type="button" size="sm" onClick={handleCopy} className="bg-[#C63C0B] hover:bg-[#B23509]">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copiado!" : "Copiar senha"}
      </Button>
    </div>
  )
}
