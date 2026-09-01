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
import { Textarea } from "@/components/ui/textarea"
import { OfferImage } from "@/components/offers/offer-image"
import { ApiError } from "@/lib/api/client"
import { updateOffer, type OfferSummary, type UpdateOfferInput } from "@/lib/api/offers"
import { OFFER_STATUS_OPTIONS, type OfferStatus } from "@/lib/offers/status"

export function OfferEditForm({ offer, onDone }: { offer: OfferSummary; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = React.useState(offer.title)
  const [description, setDescription] = React.useState(offer.description)
  const [costInCoins, setCostInCoins] = React.useState(String(offer.costInCoins))
  const [imageUrl, setImageUrl] = React.useState(offer.imageUrl ?? "")
  const [status, setStatus] = React.useState<OfferStatus>(offer.status)
  const [confirmingDeactivate, setConfirmingDeactivate] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: UpdateOfferInput) => updateOffer(offer.id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(["offer", offer.id], data)
      queryClient.invalidateQueries({ queryKey: ["offers"] })
      onDone()
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar as alterações.")
    },
  })

  function buildInput(nextStatus: OfferStatus): UpdateOfferInput {
    const input: UpdateOfferInput = {}
    if (title !== offer.title) input.title = title
    if (description !== offer.description) input.description = description

    const parsedCost = Number(costInCoins)
    if (parsedCost !== offer.costInCoins) input.costInCoins = parsedCost

    const trimmedImageUrl = imageUrl.trim()
    const currentImageUrl = offer.imageUrl ?? ""
    if (trimmedImageUrl !== currentImageUrl) input.imageUrl = trimmedImageUrl ? trimmedImageUrl : null

    if (nextStatus !== offer.status) input.status = nextStatus
    return input
  }

  function submit(nextStatus: OfferStatus) {
    setError(null)

    if (!Number.isInteger(Number(costInCoins)) || Number(costInCoins) <= 0) {
      setError("Custo deve ser um número inteiro positivo.")
      return
    }

    const input = buildInput(nextStatus)
    if (Object.keys(input).length === 0) {
      onDone()
      return
    }
    mutation.mutate(input)
  }

  function handleSave() {
    if (status === "INACTIVE" && offer.status !== "INACTIVE") {
      setConfirmingDeactivate(true)
      return
    }
    submit(status)
  }

  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="grid gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Título</label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Descrição</label>
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Custo em coins</label>
            <Input value={costInCoins} inputMode="numeric" onChange={(event) => setCostInCoins(event.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Status</label>
            <Select value={status} onChange={(event) => setStatus(event.target.value as OfferStatus)}>
              {OFFER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Imagem (URL)</label>
          <div className="flex gap-2">
            <Input
              value={imageUrl}
              placeholder="https://..."
              onChange={(event) => setImageUrl(event.target.value)}
            />
            {imageUrl ? (
              <Button type="button" variant="outline" onClick={() => setImageUrl("")}>
                Remover imagem
              </Button>
            ) : null}
          </div>
          {imageUrl.trim() ? (
            <div className="mt-2 max-w-xs">
              <OfferImage src={imageUrl} alt="Preview da oferta" size="large" />
            </div>
          ) : null}
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
            <AlertDialogTitle>Desativar &quot;{offer.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              A oferta deixa de ficar disponível pra resgate. Pode ser reativada depois.
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
