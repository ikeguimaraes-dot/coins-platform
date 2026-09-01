"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConversionRateCard } from "@/components/organizations/conversion-rate-card"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { OrganizationDetailSkeleton } from "@/components/organizations/organization-detail-skeleton"
import { OrganizationEditForm } from "@/components/organizations/organization-edit-form"
import { OrganizationStatusBadge } from "@/components/organizations/organization-status-badge"
import { useCountUp } from "@/hooks/use-count-up"
import { ApiError } from "@/lib/api/client"
import { getOrganization } from "@/lib/api/organizations"
import { BRAND_ACTION } from "@/lib/dashboard/theme"
import { maskCnpj } from "@/lib/format/cnpj"

function StatCard({
  label,
  value,
  accent,
  delay = 0,
}: {
  label: string
  value: number
  accent?: boolean
  delay?: number
}) {
  const display = useCountUp(value, { delay })

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border bg-background p-4">
      <span className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span
        className="font-serif text-[28px] font-semibold leading-none"
        style={accent ? { color: BRAND_ACTION } : undefined}
      >
        {display}
      </span>
    </div>
  )
}

export function OrganizationDetailView({ id }: { id: string }) {
  const [editing, setEditing] = React.useState(false)

  const {
    data: organization,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organization", id],
    queryFn: () => getOrganization(id),
  })

  const notFound = isError && error instanceof ApiError && error.status === 404

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/empresas"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Empresas
      </Link>

      {isPending ? (
        <OrganizationDetailSkeleton />
      ) : notFound ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h3 className="font-serif text-[17px] font-semibold">Empresa não encontrada</h3>
          <p className="text-[13.5px] text-muted-foreground">Ela pode ter sido removida ou o link está incorreto.</p>
        </div>
      ) : isError || !organization ? (
        <DashboardError onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-[24px] font-semibold">{organization.name}</h1>
                <OrganizationStatusBadge status={organization.status} />
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{maskCnpj(organization.cnpj)}</p>
            </div>
            {!editing ? (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Editar
              </Button>
            ) : null}
          </div>

          {editing ? <OrganizationEditForm organization={organization} onDone={() => setEditing(false)} /> : null}

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <StatCard label="Membros" value={organization.memberCount} delay={0} />
            <StatCard label="Admins do painel" value={organization.adminUserCount} delay={70} />
            <StatCard label="Coins em circulação" value={organization.circulatingBalance} accent delay={140} />
          </div>

          <ConversionRateCard organizationId={organization.id} conversionRate={organization.conversionRate} />
        </>
      )}
    </div>
  )
}
