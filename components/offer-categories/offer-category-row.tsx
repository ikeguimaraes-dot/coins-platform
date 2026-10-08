"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import {
  deleteOfferCategory,
  updateOfferCategory,
  type OfferCategory,
  type UpdateOfferCategoryInput,
} from "@/lib/api/offer-categories"
import { cn } from "@/lib/utils"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function OfferCategoryRow({ category }: { category: OfferCategory }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = React.useState(false)
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)
  const [name, setName] = React.useState(category.name)
  const [slug, setSlug] = React.useState(category.slug)
  const [error, setError] = React.useState<string | null>(null)

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["offer-categories"] })
  }

  const updateMutation = useMutation({
    mutationFn: (input: UpdateOfferCategoryInput) => updateOfferCategory(category.id, input),
    onSuccess: () => {
      refresh()
      setEditing(false)
    },
    onError: (mutationError) => {
      setError(mutationError instanceof ApiError ? mutationError.message : "Não foi possível atualizar a categoria.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteOfferCategory(category.id),
    onSuccess: refresh,
    onError: (mutationError) => {
      setError(mutationError instanceof ApiError ? mutationError.message : "Não foi possível excluir a categoria.")
    },
  })

  function save() {
    const trimmedName = name.trim()
    const trimmedSlug = slug.trim()
    setError(null)
    if (!trimmedName) {
      setError("Informe o nome da categoria.")
      return
    }
    if (!SLUG_PATTERN.test(trimmedSlug)) {
      setError("O slug deve usar letras minúsculas, números e hífens.")
      return
    }

    const input: UpdateOfferCategoryInput = {}
    if (trimmedName !== category.name) input.name = trimmedName
    if (trimmedSlug !== category.slug) input.slug = trimmedSlug
    if (Object.keys(input).length === 0) {
      setEditing(false)
      return
    }
    updateMutation.mutate(input)
  }

  function cancelEditing() {
    setName(category.name)
    setSlug(category.slug)
    setError(null)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="border-t py-4 first:border-t-0">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nome</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Slug</label>
            <Input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} />
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={save} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEditing} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t py-4 first:border-t-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{category.name}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                category.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
              )}
            >
              {category.active ? "Ativa" : "Inativa"}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{category.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={updateMutation.isPending}
            onClick={() => {
              setError(null)
              updateMutation.mutate({ active: !category.active })
            }}
          >
            {category.active ? "Desativar" : "Ativar"}
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={() => setConfirmingDelete(true)}>
            Excluir
          </Button>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{category.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria será removida definitivamente. Se ela estiver em uso, a API poderá bloquear a exclusão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmingDelete(false)
                setError(null)
                deleteMutation.mutate()
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
