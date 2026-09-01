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
import { Select } from "@/components/ui/select"
import { ApiError } from "@/lib/api/client"
import { updatePartner, type PartnerSummary, type UpdatePartnerInput } from "@/lib/api/partners"
import { PARTNER_STATUS_OPTIONS, type PartnerStatus } from "@/lib/partners/status"

export function PartnerEditForm({ partner, onDone }: { partner: PartnerSummary; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = React.useState(partner.name)
  const [status, setStatus] = React.useState<PartnerStatus>(partner.status)
  const [confirmingDeactivate, setConfirmingDeactivate] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: UpdatePartnerInput) => updatePartner(partner.id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(["partner", partner.id], data)
      queryClient.invalidateQueries({ queryKey: ["partners"] })
      onDone()
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar as alterações.")
    },
  })

  function submit(nextStatus: PartnerStatus) {
    setError(null)
    const input: UpdatePartnerInput = {}
    if (name !== partner.name) input.name = name
    if (nextStatus !== partner.status) input.status = nextStatus
    if (Object.keys(input).length === 0) {
      onDone()
      return
    }
    mutation.mutate(input)
  }

  function handleSave() {
    if (status === "INACTIVE" && partner.status !== "INACTIVE") {
      setConfirmingDeactivate(true)
      return
    }
    submit(status)
  }

  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Nome</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Status</label>
          <Select value={status} onChange={(event) => setStatus(event.target.value as PartnerStatus)}>
            {PARTNER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <Button onClick={handleSave} disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
          {mutation.isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button variant="outline" onClick={onDone} disabled={mutation.isPending}>
          Cancelar
        </Button>
      </div>

      <AlertDialog open={confirmingDeactivate} onOpenChange={setConfirmingDeactivate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar {partner.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso bloqueia o acesso do parceiro ao portal. Ele pode ser reativado depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmingDeactivate(false)
                submit("INACTIVE")
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
