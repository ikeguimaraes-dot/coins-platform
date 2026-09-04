"use client"

import * as React from "react"
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateOrganizationDialog } from "@/components/organizations/create-organization-dialog"
import { OrganizationRow } from "@/components/organizations/organization-row"
import { OrganizationsSkeleton } from "@/components/organizations/organizations-skeleton"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { listOrganizations } from "@/lib/api/organizations"

const PAGE_SIZE = 20

export function OrganizationsView() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const query = debouncedSearch.trim()

  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["organizations", query],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listOrganizations({ cursor: pageParam, limit: PAGE_SIZE, q: query || undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  })

  const items = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[21px] font-semibold">Empresas</h1>
          {!isPending && !isError ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "empresa" : "empresas"}
              {hasNextPage ? "+" : ""}
            </p>
          ) : null}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#C63C0B] hover:bg-[#B23509]">
          <Plus className="h-4 w-4" />
          Nova empresa
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar empresa por nome..."
          className="pl-9"
        />
      </div>

      {isPending ? (
        <OrganizationsSkeleton />
      ) : isError ? (
        <DashboardError onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        query ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
            <h3 className="font-serif text-[17px] font-semibold">Nenhuma empresa encontrada</h3>
            <p className="max-w-[40ch] text-[13.5px] text-muted-foreground">
              Não encontramos nenhuma empresa com &quot;{query}&quot; no nome.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
            <h3 className="font-serif text-[17px] font-semibold">Nenhuma empresa ainda</h3>
            <p className="max-w-[40ch] text-[13.5px] text-muted-foreground">
              Crie a primeira empresa-cliente da plataforma pra começar a distribuir coins.
            </p>
            <Button onClick={() => setCreateOpen(true)} className="mt-1 bg-[#C63C0B] hover:bg-[#B23509]">
              <Plus className="h-4 w-4" />
              Nova empresa
            </Button>
          </div>
        )
      ) : (
        <>
          <div className="rounded-2xl border bg-background px-4">
            {items.map((organization) => (
              <OrganizationRow key={organization.id} organization={organization} />
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

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
