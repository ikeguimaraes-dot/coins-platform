"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/client"
import { rejectBatch, type BatchListItem } from "@/lib/api/batches"

export function RejectBatchDialog({
  batch,
  open,
  onOpenChange,
}: {
  batch: BatchListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setTimeout(() => {
        setReason("")
        setError(null)
      }, 200)
    }
  }

  const mutation = useMutation({
    mutationFn: () => rejectBatch(batch.id, reason.trim() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
      handleOpenChange(false)
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível recusar o pedido.")
      queryClient.invalidateQueries({ queryKey: ["batches"] })
    },
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recusar pedido de {batch.organizationName}?</DialogTitle>
          <DialogDescription>O motivo é opcional e fica registrado no pedido.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Motivo (opcional)"
          rows={3}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-[#C63C0B] hover:bg-[#B23509]"
          >
            {mutation.isPending ? "Recusando..." : "Confirmar recusa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
