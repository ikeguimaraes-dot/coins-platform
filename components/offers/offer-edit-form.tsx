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
import { ImageUploadField } from "@/components/shared/image-upload-field"
import { OfferCategorySelect } from "@/components/offers/offer-category-select"
import { ApiError } from "@/lib/api/client"
import { updateOffer, type OfferSummary, type UpdateOfferInput } from "@/lib/api/offers"
import { OFFER_STATUS_OPTIONS, type OfferStatus } from "@/lib/offers/status"
import { datetimeLocalToIso, isoToDatetimeLocal } from "@/lib/offers/date"

export function OfferEditForm({ offer, onDone }: { offer: OfferSummary; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = React.useState(offer.title)
  const [description, setDescription] = React.useState(offer.description)
  const [costInCoins, setCostInCoins] = React.useState(String(offer.costInCoins))
  const [originalCost, setOriginalCost] = React.useState(offer.originalCost ? String(offer.originalCost) : "")
  const [category, setCategory] = React.useState(offer.category)
  const [featured, setFeatured] = React.useState(offer.featured)
  const initialValidUntil = isoToDatetimeLocal(offer.validUntil)
  const [validUntil, setValidUntil] = React.useState(initialValidUntil)
  const [imageUrl, setImageUrl] = React.useState(offer.imageUrl ?? "")
  const [status, setStatus] = React.useState<OfferStatus>(offer.status)
  const [confirmingDeactivate, setConfirmingDeactivate] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [imageUploading, setImageUploading] = React.useState(false)
  const [categoriesReady, setCategoriesReady] = React.useState(false)

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

    const parsedOriginalCost = originalCost ? Number(originalCost) : null
    if (parsedOriginalCost !== offer.originalCost) input.originalCost = parsedOriginalCost
    if (category !== offer.category) input.category = category
    if (featured !== offer.featured) input.featured = featured
    if (validUntil !== initialValidUntil) input.validUntil = datetimeLocalToIso(validUntil)

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
    if (originalCost) {
      const parsedOriginalCost = Number(originalCost)
      if (!Number.isInteger(parsedOriginalCost) || parsedOriginalCost <= 0) {
        setError("O custo original deve ser um número inteiro positivo.")
        return
      }
      if (parsedOriginalCost <= Number(costInCoins)) {
        setError("O custo original deve ser maior que o custo atual.")
        return
      }
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
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Categoria</label>
            <OfferCategorySelect value={category} onChange={setCategory} onReadyChange={setCategoriesReady} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Custo original (opcional)</label>
            <Input value={originalCost} inputMode="numeric" onChange={(event) => setOriginalCost(event.target.value)} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Validade (opcional)</label>
            <Input type="datetime-local" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-4 w-4 rounded border-input accent-[#C63C0B]"
            />
            Marcar como destaque
          </label>
        </div>
        <ImageUploadField
          label="Imagem da oferta"
          value={imageUrl}
          onChange={(url) => setImageUrl(url ?? "")}
          pathPrefix="offers"
          onUploadingChange={setImageUploading}
        />
      </div>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <Button
          onClick={handleSave}
          disabled={mutation.isPending || imageUploading || !categoriesReady}
          className="bg-[#C63C0B] hover:bg-[#B23509]"
        >
          {imageUploading ? "Enviando imagem..." : mutation.isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button variant="outline" onClick={onDone} disabled={mutation.isPending || imageUploading}>
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
