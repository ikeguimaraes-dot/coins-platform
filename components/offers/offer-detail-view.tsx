"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { OfferDetailSkeleton } from "@/components/offers/offer-detail-skeleton"
import { OfferEditForm } from "@/components/offers/offer-edit-form"
import { EntityImage } from "@/components/shared/entity-image"
import { OfferStatusBadge } from "@/components/offers/offer-status-badge"
import { ApiError } from "@/lib/api/client"
import { getOffer } from "@/lib/api/offers"
import { listOfferCategories } from "@/lib/api/offer-categories"
import { formatInt } from "@/lib/dashboard/format"
import { BRAND_ACTION } from "@/lib/dashboard/theme"
import { formatOfferValidity } from "@/lib/offers/date"

export function OfferDetailView({ id }: { id: string }) {
  const [editing, setEditing] = React.useState(false)

  const {
    data: offer,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["offer", id],
    queryFn: () => getOffer(id),
  })

  const notFound = isError && error instanceof ApiError && error.status === 404
  const categoriesQuery = useQuery({
    queryKey: ["offer-categories", true],
    queryFn: () => listOfferCategories({ includeInactive: true }),
  })
  const categoryName = categoriesQuery.data?.items.find((category) => category.slug === offer?.category)?.name

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/ofertas"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Ofertas
      </Link>

      {isPending ? (
        <OfferDetailSkeleton />
      ) : notFound ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h3 className="font-serif text-[17px] font-semibold">Oferta não encontrada</h3>
          <p className="text-[13.5px] text-muted-foreground">Ela pode ter sido removida ou o link está incorreto.</p>
        </div>
      ) : isError || !offer ? (
        <DashboardError onRetry={() => refetch()} />
      ) : (
        <>
          <EntityImage src={offer.imageUrl} alt={offer.title} size="large" />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-[24px] font-semibold">{offer.title}</h1>
                <OfferStatusBadge status={offer.status} />
                {offer.featured ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                    Destaque
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {offer.partner.name} · {categoryName ?? offer.category}
              </p>
            </div>
            {!editing ? (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Editar
              </Button>
            ) : null}
          </div>

          {editing ? (
            <OfferEditForm offer={offer} onDone={() => setEditing(false)} />
          ) : (
            <>
              <div className="rounded-2xl border bg-background p-4">
                <span className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">Custo</span>
                {offer.originalCost ? (
                  <p className="mt-1 text-sm tabular-nums text-muted-foreground line-through">
                    De {formatInt(offer.originalCost)} coins
                  </p>
                ) : null}
                <p className="font-serif text-[28px] font-semibold leading-none" style={{ color: BRAND_ACTION }}>
                  {offer.originalCost ? "Por " : ""}{formatInt(offer.costInCoins)} coins
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Validade: {formatOfferValidity(offer.validUntil)}</p>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <span className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Descrição
                </span>
                <p className="mt-1.5 whitespace-pre-wrap text-[13.5px]">{offer.description}</p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
