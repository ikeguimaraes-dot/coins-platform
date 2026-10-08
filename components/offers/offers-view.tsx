"use client"

import * as React from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { CreateOfferDialog } from "@/components/offers/create-offer-dialog"
import { OfferRow } from "@/components/offers/offer-row"
import { OffersSkeleton } from "@/components/offers/offers-skeleton"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { listOffers } from "@/lib/api/offers"
import { listAllPartners } from "@/lib/api/partners"

const PAGE_SIZE = 20

export function OffersView() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [partnerFilter, setPartnerFilter] = React.useState("")

  const partnersQuery = useQuery({
    queryKey: ["partners", "for-select"],
    queryFn: listAllPartners,
  })
  const partners = partnersQuery.data ?? []

  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["offers", partnerFilter],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listOffers({ cursor: pageParam, limit: PAGE_SIZE, partnerId: partnerFilter || undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const items = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[21px] font-semibold">Ofertas</h1>
          {!isPending && !isError ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "oferta" : "ofertas"}
              {hasNextPage ? "+" : ""}
            </p>
          ) : null}
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={partnersQuery.isPending || partnersQuery.isError}
          className="bg-[#C63C0B] hover:bg-[#B23509]"
        >
          <Plus className="h-4 w-4" />
          Nova oferta
        </Button>
      </div>

      {partnersQuery.isError ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">Não foi possível carregar os parceiros.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => partnersQuery.refetch()}
            disabled={partnersQuery.isFetching}
          >
            {partnersQuery.isFetching ? "Tentando..." : "Tentar novamente"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <label className="text-[12.5px] font-semibold text-muted-foreground" htmlFor="partner-filter">
            Parceiro
          </label>
          <Select
            id="partner-filter"
            value={partnerFilter}
            onChange={(event) => setPartnerFilter(event.target.value)}
            disabled={partnersQuery.isPending}
            className="w-auto min-w-[220px]"
          >
            <option value="">{partnersQuery.isPending ? "Carregando parceiros..." : "Todos os parceiros"}</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {isPending ? (
        <OffersSkeleton />
      ) : isError ? (
        <DashboardError onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h3 className="font-serif text-[17px] font-semibold">Nenhuma oferta ainda</h3>
          <p className="max-w-[40ch] text-[13.5px] text-muted-foreground">
            {partnerFilter
              ? "Esse parceiro ainda não tem ofertas cadastradas."
              : "Crie a primeira oferta do catálogo pra começar."}
          </p>
          <Button onClick={() => setCreateOpen(true)} className="mt-1 bg-[#C63C0B] hover:bg-[#B23509]">
            <Plus className="h-4 w-4" />
            Nova oferta
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border bg-background px-4">
            {items.map((offer) => (
              <OfferRow key={offer.id} offer={offer} />
            ))}
          </div>
          {hasNextPage ? (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <CreateOfferDialog open={createOpen} onOpenChange={setCreateOpen} partners={partners} />
    </div>
  )
}
