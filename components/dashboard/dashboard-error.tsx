"use client"

import { AlertCircle } from "lucide-react"

export function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
      <AlertCircle className="h-7 w-7 text-[#C4362B]" />
      <h3 className="font-serif text-[17px] font-semibold">Não foi possível carregar o dashboard</h3>
      <p className="max-w-[40ch] text-[13.5px] text-muted-foreground">
        A conexão com a coins-api falhou. Verifique sua internet e tente novamente em instantes.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1.5 rounded-full bg-[#C63C0B] px-4.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#B23509]"
      >
        Tentar novamente
      </button>
    </div>
  )
}
