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
import { updateOrganization, type OrganizationSummary, type UpdateOrganizationInput } from "@/lib/api/organizations"
import { ORGANIZATION_STATUS_OPTIONS, type OrganizationStatus } from "@/lib/organizations/status"

export function OrganizationEditForm({
  organization,
  onDone,
}: {
  organization: OrganizationSummary
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = React.useState(organization.name)
  const [status, setStatus] = React.useState<OrganizationStatus>(organization.status)
  const [pendingStatus, setPendingStatus] = React.useState<OrganizationStatus | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: UpdateOrganizationInput) => updateOrganization(organization.id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(["organization", organization.id], data)
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      onDone()
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar as alterações.")
    },
  })

  function submit(nextStatus: OrganizationStatus) {
    setError(null)
    const input: UpdateOrganizationInput = {}
    if (name !== organization.name) input.name = name
    if (nextStatus !== organization.status) input.status = nextStatus
    if (Object.keys(input).length === 0) {
      onDone()
      return
    }
    mutation.mutate(input)
  }

  function handleSave() {
    const isDowngrade = status !== organization.status && (status === "SUSPENDED" || status === "CANCELED")
    if (isDowngrade) {
      setPendingStatus(status)
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
          <Select value={status} onChange={(event) => setStatus(event.target.value as OrganizationStatus)}>
            {ORGANIZATION_STATUS_OPTIONS.map((option) => (
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

      <AlertDialog open={pendingStatus !== null} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === "CANCELED" ? "Cancelar" : "Suspender"} {organization.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "CANCELED"
                ? "Isso bloqueia permanentemente o acesso da empresa ao painel e à emissão de coins."
                : "Isso bloqueia temporariamente o acesso da empresa ao painel até ser reativada."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingStatus) submit(pendingStatus)
                setPendingStatus(null)
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
