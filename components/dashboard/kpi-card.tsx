"use client"

import { useCountUp } from "@/hooks/use-count-up"
import { formatInt } from "@/lib/dashboard/format"
import { BRAND_ACTION } from "@/lib/dashboard/theme"

type KpiCardProps = {
  label: string
  value: number
  format?: (value: number) => string
  sub?: string
  subValue?: number
  subSuffix?: string
  accent?: boolean
  delay?: number
}

export function KpiCard({
  label,
  value,
  format = formatInt,
  sub,
  subValue,
  subSuffix,
  accent,
  delay = 0,
}: KpiCardProps) {
  const display = useCountUp(value, { delay, format })
  const subDisplay = useCountUp(subValue ?? null, { delay, format: formatInt })

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border bg-background p-4">
      <span className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span
        className="font-serif text-[32px] font-semibold leading-none"
        style={accent ? { color: BRAND_ACTION } : undefined}
      >
        {display}
      </span>
      {subValue != null ? (
        <span className="text-[12.5px] text-muted-foreground">
          {subDisplay} {subSuffix}
        </span>
      ) : sub ? (
        <span className="text-[12.5px] text-muted-foreground">{sub}</span>
      ) : null}
    </div>
  )
}
