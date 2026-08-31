"use client"

import { useQuery } from "@tanstack/react-query"

import { ActivityRow } from "@/components/dashboard/activity-row"
import { ChartsRow } from "@/components/dashboard/charts-row"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { KpiGrid } from "@/components/dashboard/kpi-grid"
import { RankingsRow } from "@/components/dashboard/rankings-row"
import { getPlatformDashboard } from "@/lib/api/dashboard"
import { BRAND } from "@/lib/dashboard/theme"

export function DashboardView() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["platform-dashboard"],
    queryFn: getPlatformDashboard,
  })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-serif text-[21px] font-semibold">Dashboard</h1>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-[7px] w-[7px] animate-live-pulse rounded-full" style={{ backgroundColor: BRAND }} />
          Atualizado agora
        </div>
      </div>

      {isPending ? (
        <DashboardSkeleton />
      ) : isError || !data ? (
        <DashboardError onRetry={() => refetch()} />
      ) : (
        <>
          <KpiGrid cards={data.cards} />
          <ChartsRow timeseries={data.timeseries} />
          <RankingsRow rankings={data.rankings} />
          <ActivityRow recentActivity={data.recentActivity} />
        </>
      )}
    </div>
  )
}
