"use client"

import { KpiCard } from "@/components/dashboard/kpi-card"
import { centsToReais, formatBRL } from "@/lib/dashboard/format"
import type { PlatformDashboard } from "@/lib/api/dashboard"

const STAGGER_MS = 70

const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date())

export function KpiGrid({ cards }: { cards: PlatformDashboard["cards"] }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        label="Organizações"
        value={cards.organizations.total}
        subValue={cards.organizations.active}
        subSuffix="ativas"
        delay={0}
      />
      <KpiCard
        label="Coins em circulação"
        value={cards.coinsInCirculation}
        sub="saldo ativo na plataforma"
        accent
        delay={STAGGER_MS}
      />
      <KpiCard
        label="Coins emitidos"
        value={cards.coinsIssuedTotal}
        sub="acumulado, todas as empresas"
        delay={STAGGER_MS * 2}
      />
      <KpiCard
        label="Coins resgatados"
        value={cards.coinsRedeemedTotal}
        sub="acumulado, todos os parceiros"
        delay={STAGGER_MS * 3}
      />
      <KpiCard
        label="Faturamento total"
        value={centsToReais(cards.revenue.totalInCents)}
        format={formatBRL}
        sub="acumulado"
        accent
        delay={STAGGER_MS * 4}
      />
      <KpiCard
        label="Faturamento do mês"
        value={centsToReais(cards.revenue.currentMonthInCents)}
        format={formatBRL}
        sub={monthLabel}
        delay={STAGGER_MS * 5}
      />
    </div>
  )
}
