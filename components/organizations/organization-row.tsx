import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { OrganizationStatusBadge } from "@/components/organizations/organization-status-badge"
import { formatInt } from "@/lib/dashboard/format"
import { maskCnpj } from "@/lib/format/cnpj"
import { formatConversionRate } from "@/lib/organizations/rate"
import type { OrganizationListItem } from "@/lib/api/organizations"

export function OrganizationRow({ organization }: { organization: OrganizationListItem }) {
  const rate = organization.conversionRate

  return (
    <Link
      href={`/empresas/${organization.id}`}
      className="flex items-center gap-4 border-t px-1 py-3.5 transition-colors first:border-t-0 hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold">{organization.name}</span>
          <OrganizationStatusBadge status={organization.status} />
        </div>
        <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
          {maskCnpj(organization.cnpj)} · {formatInt(organization.memberCount)} membros ·{" "}
          {formatInt(organization.adminUserCount)} admins
        </div>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <div className="text-[13.5px] font-bold tabular-nums">{formatInt(organization.circulatingBalance)} coins</div>
        <div className="text-[12px] tabular-nums text-muted-foreground">
          {rate ? `${formatConversionRate(rate.coinsPerReal)}/R$` : "—"}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
