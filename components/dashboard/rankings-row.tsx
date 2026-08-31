"use client"

import { RankingCard } from "@/components/dashboard/ranking-card"
import { formatInt } from "@/lib/dashboard/format"
import type { PlatformDashboard } from "@/lib/api/dashboard"

export function RankingsRow({ rankings }: { rankings: PlatformDashboard["rankings"] }) {
  const orgRows = rankings.topOrganizationsByCoinsIssued.map((org) => ({
    id: org.organizationId,
    name: org.name,
    value: org.coinsIssued,
    displayValue: formatInt(org.coinsIssued),
  }))

  const partnerRows = rankings.topPartnersByConfirmedRedemptions.map((partner) => ({
    id: partner.partnerId,
    name: partner.name,
    value: partner.confirmedRedemptions,
    displayValue: `${formatInt(partner.confirmedRedemptions)} resgates`,
  }))

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
      <RankingCard
        title="Top empresas por coins emitidos"
        rows={orgRows}
        play={orgRows.length > 0}
        emptyMessage="Nenhuma empresa emitiu coins ainda."
      />
      <RankingCard
        title="Top parceiros por resgates confirmados"
        rows={partnerRows}
        play={partnerRows.length > 0}
        emptyMessage="Nenhum resgate confirmado ainda."
      />
    </div>
  )
}
