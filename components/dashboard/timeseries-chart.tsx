"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { BORDER, FAINT, MUTED } from "@/lib/dashboard/theme"

type Point = { month: string; value: number }

type ChartTooltipProps = {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  formatValue: (value: number) => string
}

function ChartTooltip({ active, payload, label, formatValue }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0]
  if (!point) return null

  return (
    <div className="rounded-lg bg-foreground px-2.5 py-1.5 text-[11.5px] text-background shadow-lg">
      {label} · <strong className="tabular-nums">{formatValue(point.value)}</strong>
    </div>
  )
}

type TimeseriesChartProps = {
  title: string
  subtitle?: string
  data: Point[]
  color: string
  formatValue: (value: number) => string
  play: boolean
}

export function TimeseriesChart({ title, subtitle, data, color, formatValue, play }: TimeseriesChartProps) {
  const reducedMotion = useReducedMotion()
  const hasPlayedRef = React.useRef(false)
  const shouldAnimate = play && !hasPlayedRef.current && !reducedMotion

  React.useEffect(() => {
    if (play) hasPlayedRef.current = true
  }, [play])

  const tickIndexes = [0, Math.floor((data.length - 1) / 2), data.length - 1]
  const ticks = Array.from(new Set(tickIndexes.map((i) => data[i]?.month).filter(Boolean))) as string[]

  return (
    <div className="rounded-2xl border bg-background p-4 pb-2">
      <h3 className="font-serif text-[15px] font-semibold">{title}</h3>
      {subtitle ? <p className="mb-1.5 text-[11.5px] text-muted-foreground">{subtitle}</p> : null}
      <div className="h-[120px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-muted-foreground">
            Ainda não há dados suficientes.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={BORDER} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                interval={0}
                ticks={ticks}
                tick={{ fontSize: 9.5, fill: MUTED }}
              />
              <Tooltip
                content={<ChartTooltip formatValue={formatValue} />}
                cursor={{ stroke: FAINT, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.1}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#fff" }}
                isAnimationActive={shouldAnimate}
                animationDuration={1150}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
