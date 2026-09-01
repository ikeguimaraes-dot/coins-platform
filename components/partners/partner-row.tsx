import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { PartnerStatusBadge } from "@/components/partners/partner-status-badge"
import { formatInt } from "@/lib/dashboard/format"
import { formatTakeRate } from "@/lib/partners/rate"
import type { PartnerListItem } from "@/lib/api/partners"

export function PartnerRow({ partner }: { partner: PartnerListItem }) {
  return (
    <Link
      href={`/parceiros/${partner.id}`}
      className="flex items-center gap-4 border-t px-1 py-3.5 transition-colors first:border-t-0 hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold">{partner.name}</span>
          <PartnerStatusBadge status={partner.status} />
        </div>
        <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
          {partner.category} · {formatInt(partner.offerCount)} ofertas · {formatInt(partner.confirmedRedemptionCount)}{" "}
          resgates
        </div>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <div className="text-[13.5px] font-bold tabular-nums">{formatTakeRate(partner.takeRateBps)}</div>
        <div className="max-w-[160px] truncate text-[12px] text-muted-foreground" style={{ fontFamily: "monospace" }}>
          {partner.pixKey}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
