"use client"

import * as React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CreatePartnerDialog } from "@/components/partners/create-partner-dialog"
import { PartnerRow } from "@/components/partners/partner-row"
import { PartnersSkeleton } from "@/components/partners/partners-skeleton"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { listPartners } from "@/lib/api/partners"

const PAGE_SIZE = 20

export function PartnersView() {
  const [createOpen, setCreateOpen] = React.useState(false)

  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["partners"],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listPartners({ cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const items = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[21px] font-semibold">Parceiros</h1>
          {!isPending && !isError ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "parceiro" : "parceiros"}
              {hasNextPage ? "+" : ""}
            </p>
          ) : null}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#C63C0B] hover:bg-[#B23509]">
          <Plus className="h-4 w-4" />
          Novo parceiro
        </Button>
      </div>

      {isPending ? (
        <PartnersSkeleton />
      ) : isError ? (
        <DashboardError onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h3 className="font-serif text-[17px] font-semibold">Nenhum parceiro ainda</h3>
          <p className="max-w-[40ch] text-[13.5px] text-muted-foreground">
            Cadastre o primeiro parceiro da rede pra começar a receber resgates.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="mt-1 bg-[#C63C0B] hover:bg-[#B23509]">
            <Plus className="h-4 w-4" />
            Novo parceiro
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border bg-background px-4">
            {items.map((partner) => (
              <PartnerRow key={partner.id} partner={partner} />
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

      <CreatePartnerDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
