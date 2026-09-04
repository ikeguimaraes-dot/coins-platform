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
import { ApiError } from "@/lib/api/client"
import { approveBatch, type BatchListItem } from "@/lib/api/batches"
import { centsToReais, formatBRL, formatInt } from "@/lib/dashboard/format"

export function ApproveBatchDialog({
  batch,
  open,
  onOpenChange,
}: {
  batch: BatchListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [error, setError] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => approveBatch(batch.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
      onOpenChange(false)
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível aprovar o pedido.")
      queryClient.invalidateQueries({ queryKey: ["batches"] })
    },
  })

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) setError(null)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aprovar pedido de {batch.organizationName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso libera {formatInt(batch.totalCoins)} coins ({formatBRL(centsToReais(batch.priceInCents))}) pro
            estoque da empresa. Não pode ser desfeito por aqui.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Aprovando..." : "Aprovar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
