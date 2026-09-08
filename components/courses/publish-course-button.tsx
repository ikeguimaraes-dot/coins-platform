"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

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
import { ApiError } from "@/lib/api/client"
import { updateCourse, type CourseDetail } from "@/lib/api/courses"

export function PublishCourseButton({ course }: { course: CourseDetail }) {
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isPublished = course.status === "PUBLISHED"
  const hasLessons = course.lessons.length > 0
  const hasQuiz = course.quiz !== null && course.quiz.questions.length > 0
  const canPublish = hasLessons && hasQuiz

  const mutation = useMutation({
    mutationFn: (status: "DRAFT" | "PUBLISHED") => updateCourse(course.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", course.id] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      setConfirmOpen(false)
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar o status do curso.")
    },
  })

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={isPublished ? "outline" : "default"}
        onClick={() => {
          setError(null)
          setConfirmOpen(true)
        }}
        disabled={!isPublished && !canPublish}
        className={isPublished ? undefined : "bg-[#C63C0B] hover:bg-[#B23509]"}
      >
        {isPublished ? "Despublicar" : "Publicar"}
      </Button>
      {!isPublished && !canPublish ? (
        <p className="max-w-[220px] text-right text-[11.5px] text-muted-foreground">
          Adicione pelo menos 1 aula e o quiz pra poder publicar.
        </p>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPublished ? "Despublicar" : "Publicar"} &quot;{course.title}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPublished
                ? "O curso deixa de aparecer pros usuários finais. Você pode publicar de novo depois."
                : "O curso fica visível pros usuários finais imediatamente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                mutation.mutate(isPublished ? "DRAFT" : "PUBLISHED")
              }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Salvando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
