"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"

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
import { LessonFormDialog } from "@/components/courses/lesson-form-dialog"
import { ReorderButtons } from "@/components/courses/reorder-buttons"
import { ApiError } from "@/lib/api/client"
import { removeLesson, updateLesson, type CourseDetail, type Lesson } from "@/lib/api/courses"
import { formatDuration } from "@/lib/courses/duration"

export function LessonsSection({ course }: { course: CourseDetail }) {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingLesson, setEditingLesson] = React.useState<Lesson | null>(null)
  const [removingLesson, setRemovingLesson] = React.useState<Lesson | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const lessons = [...course.lessons].sort((a, b) => a.displayOrder - b.displayOrder)

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["course", course.id] })
  }

  const reorderMutation = useMutation({
    mutationFn: async ({ a, b }: { a: Lesson; b: Lesson }) => {
      await updateLesson(course.id, a.id, { displayOrder: b.displayOrder })
      await updateLesson(course.id, b.id, { displayOrder: a.displayOrder })
    },
    onSuccess: invalidate,
    onError: (err) => setError(err instanceof ApiError ? err.message : "Não foi possível reordenar."),
  })

  const removeMutation = useMutation({
    mutationFn: (lessonId: string) => removeLesson(course.id, lessonId),
    onSuccess: () => {
      invalidate()
      setRemovingLesson(null)
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Não foi possível remover a aula."),
  })

  function moveLesson(index: number, direction: -1 | 1) {
    const current = lessons[index]
    const target = lessons[index + direction]
    if (!current || !target) return
    setError(null)
    reorderMutation.mutate({ a: current, b: target })
  }

  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-[17px] font-semibold">Aulas</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingLesson(null)
            setFormOpen(true)
          }}
          className="bg-[#C63C0B] hover:bg-[#B23509]"
        >
          <Plus className="h-4 w-4" />
          Adicionar aula
        </Button>
      </div>

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      {lessons.length === 0 ? (
        <p className="mt-3 text-[13.5px] text-muted-foreground">Nenhuma aula ainda.</p>
      ) : (
        <div className="mt-3 flex flex-col">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="flex items-center gap-3 border-t py-2.5 first:border-t-0">
              <ReorderButtons
                canMoveUp={index > 0}
                canMoveDown={index < lessons.length - 1}
                onMoveUp={() => moveLesson(index, -1)}
                onMoveDown={() => moveLesson(index, 1)}
                disabled={reorderMutation.isPending}
              />
              <span className="w-5 shrink-0 text-[12px] font-bold tabular-nums text-muted-foreground">
                {index + 1}.
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{lesson.title}</span>
              <span className="shrink-0 text-[12.5px] tabular-nums text-muted-foreground">
                {formatDuration(lesson.durationSeconds)}
              </span>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingLesson(lesson)
                    setFormOpen(true)
                  }}
                >
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRemovingLesson(lesson)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LessonFormDialog
        courseId={course.id}
        lesson={editingLesson}
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next)
          if (!next) setEditingLesson(null)
        }}
      />

      <AlertDialog open={removingLesson !== null} onOpenChange={(open) => !open && setRemovingLesson(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover &quot;{removingLesson?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                if (removingLesson) removeMutation.mutate(removingLesson.id)
              }}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
