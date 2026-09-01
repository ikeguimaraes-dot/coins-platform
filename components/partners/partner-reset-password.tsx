"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PartnerPasswordReveal } from "@/components/partners/partner-password-reveal"
import { ApiError } from "@/lib/api/client"
import { resetPartnerPassword } from "@/lib/api/partners"

export function PartnerResetPassword({ partnerId, partnerName }: { partnerId: string; partnerName: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [password, setPassword] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => resetPartnerPassword(partnerId),
    onSuccess: (data) => {
      setConfirmOpen(false)
      setPassword(data.credential.password)
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível resetar a senha.")
    },
  })

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setError(null)
          setConfirmOpen(true)
        }}
      >
        Resetar senha
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar a senha de {partnerName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso desconecta todas as sessões ativas do parceiro e invalida a senha atual. Uma senha nova será
              gerada.
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
              {mutation.isPending ? "Resetando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={password !== null} onOpenChange={(open) => !open && setPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha redefinida</DialogTitle>
            <DialogDescription>
              A senha anterior parou de funcionar e todas as sessões do parceiro foram encerradas. Envie esta nova
              senha por um canal seguro — ela não será mostrada novamente.
            </DialogDescription>
          </DialogHeader>
          {password ? <PartnerPasswordReveal password={password} /> : null}
          <DialogFooter>
            <Button type="button" onClick={() => setPassword(null)}>
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
