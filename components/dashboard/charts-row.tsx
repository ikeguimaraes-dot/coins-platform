"use client"

import { TimeseriesChart } from "@/components/dashboard/timeseries-chart"
import { centsToReais, formatBRL, formatInt, formatMonthShort } from "@/lib/dashboard/format"
import { BRAND, CHART_INK } from "@/lib/dashboard/theme"
import type { PlatformDashboard } from "@/lib/api/dashboard"

export function ChartsRow({ timeseries }: { timeseries: PlatformDashboard["timeseries"] }) {
  const points = timeseries.points
  const play = points.length > 0

  const issued = points.map((p) => ({ month: formatMonthShort(p.month), value: p.coinsIssued }))
  const redeemed = points.map((p) => ({ month: formatMonthShort(p.month), value: p.coinsRedeemed }))
  const revenue = points.map((p) => ({ month: formatMonthShort(p.month), value: centsToReais(p.revenueInCents) }))

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
      <TimeseriesChart
        title="Emissão de coins"
        subtitle="Últimos 12 meses"
        data={issued}
        color={CHART_INK}
        formatValue={formatInt}
        play={play}
      />
      <TimeseriesChart
        title="Resgates"
        subtitle="Últimos 12 meses"
        data={redeemed}
        color={CHART_INK}
        formatValue={formatInt}
        play={play}
      />
      <TimeseriesChart
        title="Faturamento"
        subtitle="Últimos 12 meses"
        data={revenue}
        color={BRAND}
        formatValue={formatBRL}
        play={play}
      />
    </div>
  )
}
