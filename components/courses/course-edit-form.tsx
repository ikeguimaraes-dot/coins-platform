"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EntityImage } from "@/components/shared/entity-image"
import { ApiError } from "@/lib/api/client"
import { updateCourse, type CourseDetail, type UpdateCourseInput } from "@/lib/api/courses"

export function CourseEditForm({ course, onDone }: { course: CourseDetail; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = React.useState(course.title)
  const [description, setDescription] = React.useState(course.description)
  const [coverImageUrl, setCoverImageUrl] = React.useState(course.coverImageUrl ?? "")
  const [displayOrder, setDisplayOrder] = React.useState(String(course.displayOrder))
  const [error, setError] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: UpdateCourseInput) => updateCourse(course.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", course.id] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      onDone()
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar as alterações.")
    },
  })

  function handleSave() {
    setError(null)

    if (!Number.isInteger(Number(displayOrder))) {
      setError("Ordem deve ser um número inteiro.")
      return
    }

    const input: UpdateCourseInput = {}
    if (title !== course.title) input.title = title
    if (description !== course.description) input.description = description

    const trimmedImageUrl = coverImageUrl.trim()
    const currentImageUrl = course.coverImageUrl ?? ""
    if (trimmedImageUrl !== currentImageUrl) input.coverImageUrl = trimmedImageUrl ? trimmedImageUrl : null

    const parsedOrder = Number(displayOrder)
    if (parsedOrder !== course.displayOrder) input.displayOrder = parsedOrder

    if (Object.keys(input).length === 0) {
      onDone()
      return
    }
    mutation.mutate(input)
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
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Ordem de exibição</label>
          <Input
            value={displayOrder}
            inputMode="numeric"
            onChange={(event) => setDisplayOrder(event.target.value)}
            className="max-w-[120px]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Imagem de capa (URL)</label>
          <div className="flex gap-2">
            <Input
              value={coverImageUrl}
              placeholder="https://..."
              onChange={(event) => setCoverImageUrl(event.target.value)}
            />
            {coverImageUrl ? (
              <Button type="button" variant="outline" onClick={() => setCoverImageUrl("")}>
                Remover imagem
              </Button>
            ) : null}
          </div>
          {coverImageUrl.trim() ? (
            <div className="mt-2 max-w-xs">
              <EntityImage src={coverImageUrl} alt="Preview da capa" size="large" />
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
    </div>
  )
}
