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
import { ApiError } from "@/lib/api/client"
import { createOfferCategory } from "@/lib/api/offer-categories"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  slug: z.string().trim().min(1, "Informe o slug").regex(SLUG_PATTERN, "Use letras minúsculas, números e hífens"),
})

type FormValues = z.infer<typeof schema>

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function CreateOfferCategoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [slugEdited, setSlugEdited] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
  })

  const mutation = useMutation({
    mutationFn: createOfferCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-categories"] })
      onOpenChange(false)
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível criar a categoria.")
    },
  })

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setTimeout(() => {
        form.reset()
        setSlugEdited(false)
        setFormError(null)
      }, 200)
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate({ name: values.name.trim(), slug: values.slug.trim() })
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>Crie uma categoria para organizar as ofertas do catálogo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      onChange={(event) => {
                        field.onChange(event)
                        if (!slugEdited) form.setValue("slug", slugify(event.target.value), { shouldValidate: true })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="alimentacao"
                      onChange={(event) => {
                        setSlugEdited(true)
                        field.onChange(event.target.value.toLowerCase())
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
                {mutation.isPending ? "Criando..." : "Criar categoria"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
