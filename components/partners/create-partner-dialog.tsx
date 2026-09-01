"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { PartnerPasswordReveal } from "@/components/partners/partner-password-reveal"
import { ApiError } from "@/lib/api/client"
import { createPartner, type CreatePartnerResponse } from "@/lib/api/partners"
import { isValidCnpj, maskCnpj, unmaskCnpj } from "@/lib/format/cnpj"
import { percentToBps } from "@/lib/partners/rate"

const schema = z.object({
  name: z.string().min(1, "Informe o nome do parceiro"),
  cnpj: z.string().min(1, "Informe o CNPJ").refine(isValidCnpj, "CNPJ inválido"),
  category: z.string().min(1, "Informe a categoria"),
  contactEmail: z.string().min(1, "Informe o e-mail de login").email("E-mail inválido"),
  contactPhone: z.string().optional(),
  pixKey: z.string().min(1, "Informe a chave PIX"),
  takeRate: z
    .string()
    .min(1, "Informe a taxa")
    .refine((value) => {
      const normalized = Number(value.replace(",", "."))
      return Number.isFinite(normalized) && normalized >= 0
    }, "Taxa inválida"),
})

type FormValues = z.infer<typeof schema>

export function CreatePartnerDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [result, setResult] = React.useState<CreatePartnerResponse | null>(null)
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", cnpj: "", category: "", contactEmail: "", contactPhone: "", pixKey: "", takeRate: "" },
  })

  const mutation = useMutation({
    mutationFn: createPartner,
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: ["partners"] })
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível criar o parceiro.")
    },
  })

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setTimeout(() => {
        form.reset()
        setResult(null)
        setFormError(null)
      }, 200)
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate({
      name: values.name,
      cnpj: unmaskCnpj(values.cnpj),
      category: values.category,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone || undefined,
      pixKey: values.pixKey,
      takeRateBps: percentToBps(Number(values.takeRate.replace(",", "."))),
    })
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {result ? (
          <>
            <DialogHeader>
              <DialogTitle>Parceiro criado com sucesso</DialogTitle>
              <DialogDescription>
                Guarde e envie esta senha ao parceiro por um canal seguro. Ela não será mostrada novamente.
              </DialogDescription>
            </DialogHeader>
            <PartnerPasswordReveal password={result.credential.password} />
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Concluir
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Novo parceiro</DialogTitle>
              <DialogDescription>Cadastre o parceiro e gere a credencial de acesso ao portal.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do parceiro</FormLabel>
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Posto de combustível" autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail de login</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone de contato (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pixKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave PIX</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="takeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa da plataforma (%)</FormLabel>
                      <FormControl>
                        <Input {...field} inputMode="decimal" placeholder="2,5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                <DialogFooter>
                  <Button type="submit" disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
                    {mutation.isPending ? "Criando..." : "Criar parceiro"}
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
