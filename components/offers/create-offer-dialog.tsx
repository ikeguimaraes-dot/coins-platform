"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { OfferImage } from "@/components/offers/offer-image"
import { ApiError } from "@/lib/api/client"
import { createOffer } from "@/lib/api/offers"
import type { PartnerListItem } from "@/lib/api/partners"

const schema = z.object({
  title: z.string().min(1, "Informe o título"),
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().min(1, "Informe a categoria"),
  costInCoins: z
    .string()
    .min(1, "Informe o custo")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) > 0,
      "Custo deve ser um número inteiro positivo"
    ),
  partnerId: z.string().min(1, "Selecione um parceiro"),
  imageUrl: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CreateOfferDialog({
  open,
  onOpenChange,
  partners,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  partners: PartnerListItem[]
}) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", category: "", costInCoins: "", partnerId: "", imageUrl: "" },
  })

  const imageUrl = form.watch("imageUrl")

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setTimeout(() => {
        form.reset()
        setFormError(null)
      }, 200)
    }
  }

  const mutation = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      toast.success("Oferta criada.")
      queryClient.invalidateQueries({ queryKey: ["offers"] })
      handleOpenChange(false)
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível criar a oferta.")
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate({
      title: values.title,
      description: values.description,
      category: values.category,
      costInCoins: Number(values.costInCoins),
      partnerId: values.partnerId,
      imageUrl: values.imageUrl?.trim() ? values.imageUrl.trim() : undefined,
    })
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova oferta</DialogTitle>
          <DialogDescription>Cadastre uma oferta pra um parceiro existente.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Combustível" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costInCoins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo em coins</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" placeholder="1200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="partnerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parceiro</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="">Selecione um parceiro</option>
                      {partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem (URL, opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {imageUrl?.trim() ? <OfferImage src={imageUrl} alt="Preview da oferta" size="large" /> : null}
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
                {mutation.isPending ? "Criando..." : "Criar oferta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
