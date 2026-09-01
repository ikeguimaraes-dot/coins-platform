"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { PartnerCommercialTerms } from "@/components/partners/partner-commercial-terms"
import { PartnerDetailSkeleton } from "@/components/partners/partner-detail-skeleton"
import { PartnerEditForm } from "@/components/partners/partner-edit-form"
import { PartnerResetPassword } from "@/components/partners/partner-reset-password"
import { PartnerStatusBadge } from "@/components/partners/partner-status-badge"
import { useCountUp } from "@/hooks/use-count-up"
import { ApiError } from "@/lib/api/client"
import { getPartner } from "@/lib/api/partners"
import { maskCnpj } from "@/lib/format/cnpj"

function StatCard({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const display = useCountUp(value, { delay })

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border bg-background p-4">
      <span className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-serif text-[28px] font-semibold leading-none">{display}</span>
    </div>
  )
}

export function PartnerDetailView({ id }: { id: string }) {
  const [editing, setEditing] = React.useState(false)

  const {
    data: partner,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["partner", id],
    queryFn: () => getPartner(id),
  })

  const notFound = isError && error instanceof ApiError && error.status === 404

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/parceiros"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Parceiros
      </Link>

      {isPending ? (
        <PartnerDetailSkeleton />
      ) : notFound ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h3 className="font-serif text-[17px] font-semibold">Parceiro não encontrado</h3>
          <p className="text-[13.5px] text-muted-foreground">Ele pode ter sido removido ou o link está incorreto.</p>
        </div>
      ) : isError || !partner ? (
        <DashboardError onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-[24px] font-semibold">{partner.name}</h1>
                <PartnerStatusBadge status={partner.status} />
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {maskCnpj(partner.cnpj)} · {partner.category}
              </p>
            </div>
            {!editing ? (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Editar
              </Button>
            ) : null}
          </div>

          {editing ? <PartnerEditForm partner={partner} onDone={() => setEditing(false)} /> : null}

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <StatCard label="Ofertas" value={partner.offerCount} delay={0} />
            <StatCard label="Resgates confirmados" value={partner.confirmedRedemptionCount} delay={70} />
          </div>

          <PartnerCommercialTerms partner={partner} />

          <div>
            <PartnerResetPassword partnerId={partner.id} partnerName={partner.name} />
          </div>
        </>
      )}
    </div>
  )
}
