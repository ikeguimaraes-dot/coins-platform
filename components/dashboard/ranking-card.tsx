"use client"

import * as React from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { BAR_TRACK, BRAND, CHART_INK } from "@/lib/dashboard/theme"

type RankRow = { id: string; name: string; value: number; displayValue: string }

type RankingCardProps = {
  title: string
  rows: RankRow[]
  play: boolean
  emptyMessage: string
}

export function RankingCard({ title, rows, play, emptyMessage }: RankingCardProps) {
  const reducedMotion = useReducedMotion()
  const hasPlayedRef = React.useRef(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const max = Math.max(1, ...rows.map((row) => row.value))

  React.useEffect(() => {
    if (!play || hasPlayedRef.current || !containerRef.current) return
    hasPlayedRef.current = true

    const fills = containerRef.current.querySelectorAll<HTMLElement>("[data-rank-fill]")

    if (reducedMotion) {
      fills.forEach((fill) => {
        fill.style.transform = `scaleX(${fill.dataset.pct})`
      })
      return
    }

    // já nasce em scaleX(0) via style inline; força reflow antes de animar pro valor real
    void containerRef.current.offsetHeight
    fills.forEach((fill) => {
      fill.style.transform = `scaleX(${fill.dataset.pct})`
    })
  }, [play, reducedMotion])

  return (
    <div className="rounded-2xl border bg-background p-4">
      <h3 className="mb-3 font-serif text-[15px] font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div ref={containerRef} className="flex flex-col">
          {rows.map((row, i) => {
            const pct = row.value / max
            return (
              <div key={row.id} className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 py-1.5">
                <span className="text-[11.5px] font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                <div className="min-w-0">
                  <div className="mb-1 truncate text-[13px] font-semibold">{row.name}</div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: BAR_TRACK }}>
                    <div
                      data-rank-fill
                      data-pct={pct}
                      className="h-full origin-left rounded-full"
                      style={{
                        backgroundColor: i === 0 ? BRAND : CHART_INK,
                        transitionProperty: "transform",
                        transitionDuration: "620ms",
                        transitionDelay: `${i * 55}ms`,
                        transitionTimingFunction: "cubic-bezier(.22,.9,.3,1)",
                        transform: "scaleX(0)",
                      }}
                    />
                  </div>
                </div>
                <span className="whitespace-nowrap text-[12.5px] font-bold tabular-nums">{row.displayValue}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
