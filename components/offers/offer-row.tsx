import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { OfferImage } from "@/components/offers/offer-image"
import { OfferStatusBadge } from "@/components/offers/offer-status-badge"
import { formatInt } from "@/lib/dashboard/format"
import { BRAND_ACTION } from "@/lib/dashboard/theme"
import type { OfferListItem } from "@/lib/api/offers"

export function OfferRow({ offer }: { offer: OfferListItem }) {
  return (
    <Link
      href={`/ofertas/${offer.id}`}
      className="flex items-center gap-4 border-t px-1 py-3.5 transition-colors first:border-t-0 hover:bg-muted/40"
    >
      <OfferImage src={offer.imageUrl} alt={offer.title} size="thumb" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold">{offer.title}</span>
          <OfferStatusBadge status={offer.status} />
        </div>
        <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{offer.partner.name}</div>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <div className="text-[13.5px] font-bold tabular-nums" style={{ color: BRAND_ACTION }}>
          {formatInt(offer.costInCoins)} coins
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
