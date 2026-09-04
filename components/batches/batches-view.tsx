"use client"

import * as React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { BatchRow } from "@/components/batches/batch-row"
import { BatchesSkeleton } from "@/components/batches/batches-skeleton"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { listBatches } from "@/lib/api/batches"
import { BATCH_STATUS_FILTER_OPTIONS } from "@/lib/batches/status"

const PAGE_SIZE = 20

export function BatchesView() {
  const [statusFilter, setStatusFilter] = React.useState("PENDING")

  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["batches", statusFilter],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listBatches({ cursor: pageParam, limit: PAGE_SIZE, status: statusFilter || undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const items = data?.pages.flatMap((page) => page.items) ?? []

  const emptyMessage =
    statusFilter === "PENDING"
      ? "Nenhum pedido pendente no momento."
      : statusFilter
        ? "Nenhum pedido com esse status."
        : "Nenhum pedido registrado ainda."

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-serif text-[21px] font-semibold">Pedidos de coins</h1>
        {!isPending && !isError ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "pedido" : "pedidos"}
            {hasNextPage ? "+" : ""}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-[12.5px] font-semibold text-muted-foreground" htmlFor="batch-status-filter">
          Status
        </label>
        <Select
          id="batch-status-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-auto min-w-[180px]"
        >
          {BATCH_STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {isPending ? (
        <BatchesSkeleton />
      ) : isError ? (
        <DashboardError onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h3 className="font-serif text-[17px] font-semibold">Nada por aqui</h3>
          <p className="max-w-[40ch] text-[13.5px] text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border bg-background px-4">
            {items.map((batch) => (
              <BatchRow key={batch.id} batch={batch} />
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
    </div>
  )
}
