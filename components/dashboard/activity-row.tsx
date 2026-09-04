import { ActivityCard } from "@/components/dashboard/activity-card"
import { centsToReais, formatBRL, formatInt, formatRelativeTime } from "@/lib/dashboard/format"
import { STATUS_GOOD, STATUS_NEUTRAL } from "@/lib/dashboard/theme"
import { BATCH_STATUS } from "@/lib/batches/status"
import type { PlatformDashboard } from "@/lib/api/dashboard"

export function ActivityRow({ recentActivity }: { recentActivity: PlatformDashboard["recentActivity"] }) {
  const batchItems = recentActivity.latestBatches.map((batch) => {
    const status = BATCH_STATUS[batch.status as keyof typeof BATCH_STATUS] ?? {
      label: batch.status,
      color: STATUS_NEUTRAL,
    }
    return {
      id: batch.id,
      title: `${batch.organizationName} · ${formatInt(batch.totalCoins)} coins`,
      subtitle: `${status.label} · ${formatBRL(centsToReais(batch.priceInCents))}`,
      when: formatRelativeTime(batch.createdAt),
      statusColor: status.color,
    }
  })

  const redemptionItems = recentActivity.latestConfirmedRedemptions.map((redemption) => ({
    id: redemption.id,
    title: redemption.partnerName,
    subtitle: `${redemption.offerTitle ?? "Resgate sem oferta associada"} · ${formatInt(redemption.amount)} coins`,
    when: formatRelativeTime(redemption.confirmedAt),
    statusColor: STATUS_GOOD,
  }))

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
      <ActivityCard title="Últimos lotes" items={batchItems} emptyMessage="Nenhum lote registrado ainda." />
      <ActivityCard
        title="Últimos resgates confirmados"
        items={redemptionItems}
        emptyMessage="Nenhum resgate confirmado ainda."
      />
    </div>
  )
}
