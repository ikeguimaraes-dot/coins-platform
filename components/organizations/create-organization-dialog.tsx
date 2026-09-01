"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Copy } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { createOrganization, type CreateOrganizationResponse } from "@/lib/api/organizations"
import { isValidCnpj, maskCnpj, unmaskCnpj } from "@/lib/organizations/cnpj"

const schema = z.object({
  name: z.string().min(1, "Informe o nome da empresa"),
  cnpj: z.string().min(1, "Informe o CNPJ").refine(isValidCnpj, "CNPJ inválido"),
  ownerEmail: z.string().min(1, "Informe o e-mail do responsável").email("E-mail inválido"),
  coinsPerReal: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function parseRate(value: string | undefined): number | undefined {
  if (!value || value.trim() === "") return undefined
  const normalized = Number(value.replace(",", "."))
  return Number.isFinite(normalized) && normalized > 0 ? normalized : undefined
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [result, setResult] = React.useState<CreateOrganizationResponse | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", cnpj: "", ownerEmail: "", coinsPerReal: "" },
  })

  const mutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível criar a empresa.")
    },
  })

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setTimeout(() => {
        form.reset()
        setResult(null)
        setFormError(null)
        setCopied(false)
      }, 200)
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate({
      name: values.name,
      cnpj: unmaskCnpj(values.cnpj),
      ownerEmail: values.ownerEmail,
      coinsPerReal: parseRate(values.coinsPerReal),
    })
  })

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.invite.inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {result ? (
          <>
            <DialogHeader>
              <DialogTitle>Empresa criada com sucesso</DialogTitle>
              <DialogDescription>
                Envie este link para o responsável da empresa. Ele vai usá-lo pra criar a senha e acessar o painel.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border bg-[#FFF1EA] p-4">
              <p className="mb-3 break-all font-mono text-[12.5px] text-foreground">{result.invite.inviteLink}</p>
              <Button type="button" size="sm" onClick={handleCopy} className="bg-[#C63C0B] hover:bg-[#B23509]">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar link"}
              </Button>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Expira em {new Date(result.invite.expiresAt).toLocaleString("pt-BR")}
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Concluir
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Nova empresa</DialogTitle>
              <DialogDescription>Cadastre a empresa-cliente e convide o responsável pra criar a senha.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da empresa</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          placeholder="00.000.000/0000-00"
                          onChange={(event) => field.onChange(maskCnpj(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail do responsável</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coinsPerReal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de conversão (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} inputMode="decimal" placeholder="1,25" />
                      </FormControl>
                      <p className="text-[12px] text-muted-foreground">Padrão da plataforma se deixar em branco.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                <DialogFooter>
                  <Button type="submit" disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
                    {mutation.isPending ? "Criando..." : "Criar empresa"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
