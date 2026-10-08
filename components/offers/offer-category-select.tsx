"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { listOfferCategories } from "@/lib/api/offer-categories"

type OfferCategorySelectProps = {
  value: string
  onChange: (value: string) => void
  onReadyChange?: (ready: boolean) => void
  id?: string
}

export function OfferCategorySelect({ value, onChange, onReadyChange, id }: OfferCategorySelectProps) {
  const query = useQuery({
    queryKey: ["offer-categories", false],
    queryFn: () => listOfferCategories(),
  })
  const categories = query.data?.items ?? []
  const currentIsLegacy = Boolean(value) && !categories.some((category) => category.slug === value)
  const ready = !query.isPending && !query.isError && (categories.length > 0 || Boolean(value))

  React.useEffect(() => {
    onReadyChange?.(ready)
  }, [onReadyChange, ready])

  if (query.isError) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
        <p className="text-sm text-destructive">Não foi possível carregar as categorias.</p>
        <Button type="button" size="sm" variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? "Tentando..." : "Tentar novamente"}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-1.5">
      <Select
        id={id}
        value={value}
        disabled={query.isPending || categories.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{query.isPending ? "Carregando categorias..." : "Selecione uma categoria"}</option>
        {currentIsLegacy ? <option value={value}>Categoria atual (legada): {value}</option> : null}
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </Select>
      {!query.isPending && categories.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhuma categoria ativa. <Link href="/categorias-de-oferta" className="font-semibold underline">Gerenciar categorias</Link>
        </p>
      ) : null}
    </div>
  )
}
