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
import { EntityImage } from "@/components/shared/entity-image"
import { ApiError } from "@/lib/api/client"
import { addLesson, updateLesson, type Lesson } from "@/lib/api/courses"
import { minutesAndSecondsToSeconds, secondsToMinutesAndSeconds } from "@/lib/courses/duration"

const schema = z.object({
  title: z.string().min(1, "Informe o título"),
  videoUrl: z.string().min(1, "Informe a URL do vídeo"),
  thumbnailUrl: z.string().optional(),
  minutes: z
    .string()
    .min(1, "Informe os minutos")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, "Minutos inválidos"),
  seconds: z
    .string()
    .min(1, "Informe os segundos")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) < 60,
      "Segundos inválidos (0-59)"
    ),
  displayOrder: z
    .string()
    .min(1, "Informe a ordem")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, "Ordem inválida"),
})

type FormValues = z.infer<typeof schema>

export function LessonFormDialog({
  courseId,
  lesson,
  open,
  onOpenChange,
}: {
  courseId: string
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = React.useState<string | null>(null)
  const isEditing = lesson !== null

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", videoUrl: "", thumbnailUrl: "", minutes: "0", seconds: "0", displayOrder: "0" },
  })

  const thumbnailUrl = form.watch("thumbnailUrl")

  React.useEffect(() => {
    if (!open) return
    if (lesson) {
      const { minutes, seconds } = secondsToMinutesAndSeconds(lesson.durationSeconds)
      form.reset({
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        thumbnailUrl: lesson.thumbnailUrl ?? "",
        minutes: String(minutes),
        seconds: String(seconds),
        displayOrder: String(lesson.displayOrder),
      })
    } else {
      form.reset({ title: "", videoUrl: "", thumbnailUrl: "", minutes: "0", seconds: "0", displayOrder: "0" })
    }
    setFormError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lesson])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const trimmedThumbnailUrl = values.thumbnailUrl?.trim() ?? ""
      const durationSeconds = minutesAndSecondsToSeconds(Number(values.minutes), Number(values.seconds))

      if (isEditing) {
        return updateLesson(courseId, lesson.id, {
          title: values.title,
          videoUrl: values.videoUrl,
          thumbnailUrl: trimmedThumbnailUrl ? trimmedThumbnailUrl : null,
          durationSeconds,
          displayOrder: Number(values.displayOrder),
        })
      }

      return addLesson(courseId, {
        title: values.title,
        videoUrl: values.videoUrl,
        ...(trimmedThumbnailUrl ? { thumbnailUrl: trimmedThumbnailUrl } : {}),
        durationSeconds,
        displayOrder: Number(values.displayOrder),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] })
      onOpenChange(false)
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível salvar a aula.")
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate(values)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar aula" : "Adicionar aula"}</DialogTitle>
          <DialogDescription>Vídeo não listado do YouTube ou qualquer outra URL de vídeo.</DialogDescription>
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
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do vídeo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miniatura (URL, opcional)</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input {...field} placeholder="https://..." autoComplete="off" />
                      {field.value ? (
                        <Button type="button" variant="outline" onClick={() => field.onChange("")}>
                          Remover
                        </Button>
                      ) : null}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {thumbnailUrl?.trim() ? (
              <div className="max-w-xs">
                <EntityImage src={thumbnailUrl} alt="Preview da miniatura" size="large" />
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutos</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segundos</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" />
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
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
                {mutation.isPending ? "Salvando..." : isEditing ? "Salvar aula" : "Adicionar aula"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
