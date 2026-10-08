import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { EntityImage } from "@/components/shared/entity-image"
import { OfferStatusBadge } from "@/components/offers/offer-status-badge"
import { formatInt } from "@/lib/dashboard/format"
import { BRAND_ACTION } from "@/lib/dashboard/theme"
import type { OfferListItem } from "@/lib/api/offers"

export function OfferRow({ offer, categoryName }: { offer: OfferListItem; categoryName?: string }) {
  return (
    <Link
      href={`/ofertas/${offer.id}`}
      className="flex items-center gap-4 border-t px-1 py-3.5 transition-colors first:border-t-0 hover:bg-muted/40"
    >
      <EntityImage src={offer.imageUrl} alt={offer.title} size="thumb" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold">{offer.title}</span>
          <OfferStatusBadge status={offer.status} />
          {offer.featured ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              Destaque
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
          {offer.partner.name} · {categoryName ?? offer.category}
        </div>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        {offer.originalCost ? (
          <div className="text-[11.5px] tabular-nums text-muted-foreground line-through">
            {formatInt(offer.originalCost)} coins
          </div>
        ) : null}
        <div className="text-[13.5px] font-bold tabular-nums" style={{ color: BRAND_ACTION }}>
          {formatInt(offer.costInCoins)} coins
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
