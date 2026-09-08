"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { EntityImage } from "@/components/shared/entity-image"
import { ApiError } from "@/lib/api/client"
import { createCourse } from "@/lib/api/courses"

const schema = z.object({
  title: z.string().min(1, "Informe o título"),
  description: z.string().min(1, "Informe a descrição"),
  coverImageUrl: z.string().optional(),
  displayOrder: z
    .string()
    .min(1, "Informe a ordem")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, "Ordem deve ser um número inteiro"),
})

type FormValues = z.infer<typeof schema>

export function CreateCourseDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", coverImageUrl: "", displayOrder: "0" },
  })

  const coverImageUrl = form.watch("coverImageUrl")

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
    mutationFn: createCourse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      handleOpenChange(false)
      router.push(`/cursos/${data.id}`)
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível criar o curso.")
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate({
      title: values.title,
      description: values.description,
      coverImageUrl: values.coverImageUrl?.trim() ? values.coverImageUrl.trim() : undefined,
      displayOrder: Number(values.displayOrder),
    })
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo curso</DialogTitle>
          <DialogDescription>Depois de criar, você já pode adicionar aulas e o quiz.</DialogDescription>
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
            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de exibição</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="numeric" placeholder="0" className="max-w-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem de capa (URL, opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {coverImageUrl?.trim() ? <EntityImage src={coverImageUrl} alt="Preview da capa" size="large" /> : null}
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
                {mutation.isPending ? "Criando..." : "Criar curso"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
