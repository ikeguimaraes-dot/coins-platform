"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { updateConversionRate, type ConversionRate, type OrganizationSummary } from "@/lib/api/organizations"
import { formatConversionRate } from "@/lib/organizations/rate"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

export function ConversionRateCard({
  organizationId,
  conversionRate,
}: {
  organizationId: string
  conversionRate: ConversionRate | null
}) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = React.useState(false)
  const [value, setValue] = React.useState(
    conversionRate ? String(conversionRate.coinsPerReal).replace(".", ",") : ""
  )
  const [error, setError] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (coinsPerReal: number) => updateConversionRate(organizationId, coinsPerReal),
    onSuccess: (data) => {
      queryClient.setQueryData<OrganizationSummary | undefined>(["organization", organizationId], (prev) =>
        prev ? { ...prev, conversionRate: data } : prev
      )
      setEditing(false)
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar a nova taxa.")
    },
  })

  const parsed = Number(value.replace(",", "."))
  const isValidValue = value.trim() !== "" && Number.isFinite(parsed) && parsed > 0

  function handleSave() {
    if (!isValidValue) {
      setError("Informe uma taxa válida, maior que zero.")
      return
    }
    setError(null)
    mutation.mutate(parsed)
  }

  return (
    <div className="rounded-2xl border-2 border-[#FFDCC7] bg-[#FFF1EA] p-5">
      <h3 className="font-serif text-[15px] font-semibold">Taxa de conversão</h3>

      {!editing ? (
        <>
          {conversionRate ? (
            <>
              <p className="mt-2 font-serif text-[28px] font-semibold leading-none">
                {formatConversionRate(conversionRate.coinsPerReal)} coins por R$
              </p>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                Vigente desde {formatDate(conversionRate.effectiveSince)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-[13.5px] text-muted-foreground">Nenhuma taxa definida ainda.</p>
          )}
          <Button
            variant="outline"
            className="mt-3 bg-background"
            onClick={() => {
              setValue(conversionRate ? String(conversionRate.coinsPerReal).replace(".", ",") : "")
              setError(null)
              setEditing(true)
            }}
          >
            Editar taxa
          </Button>
        </>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <Input
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="1,25"
            className="max-w-[160px] bg-background"
            autoFocus
          />
          <p className="text-[12.5px] text-muted-foreground">
            {isValidValue ? `R$ 1,00 = ${formatConversionRate(parsed)} coins` : "Digite a nova taxa"}
          </p>
          <p className="text-[12px] text-muted-foreground">
            Isso cria uma taxa nova — lotes já criados continuam com a taxa antiga.
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
              {mutation.isPending ? "Salvando..." : "Salvar nova taxa"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} disabled={mutation.isPending}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
