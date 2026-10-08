"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { DashboardError } from "@/components/dashboard/dashboard-error"
import { CreateOfferCategoryDialog } from "@/components/offer-categories/create-offer-category-dialog"
import { OfferCategoryRow } from "@/components/offer-categories/offer-category-row"
import { Button } from "@/components/ui/button"
import { listOfferCategories } from "@/lib/api/offer-categories"

export function OfferCategoriesView() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["offer-categories", true],
    queryFn: () => listOfferCategories({ includeInactive: true }),
  })
  const categories = data?.items ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[21px] font-semibold">Categorias de oferta</h1>
          {!isPending && !isError ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
            </p>
          ) : null}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#C63C0B] hover:bg-[#B23509]">
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {isPending ? (
        <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">Carregando categorias…</div>
      ) : isError ? (
        <DashboardError onRetry={() => refetch()} />
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h2 className="font-serif text-[17px] font-semibold">Nenhuma categoria cadastrada</h2>
          <p className="text-[13.5px] text-muted-foreground">Crie a primeira categoria para usar nas ofertas.</p>
          <Button onClick={() => setCreateOpen(true)}>Criar categoria</Button>
        </div>
      ) : (
        <div className="rounded-2xl border bg-background px-4">
          {categories.map((category) => (
            <OfferCategoryRow key={category.id} category={category} />
          ))}
        </div>
      )}

      <CreateOfferCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
