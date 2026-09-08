"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Plus, Trash2 } from "lucide-react"

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
import { QuestionFormDialog } from "@/components/courses/question-form-dialog"
import { ReorderButtons } from "@/components/courses/reorder-buttons"
import { ApiError } from "@/lib/api/client"
import { removeQuestion, updateQuestion, type CourseDetail, type QuizQuestion } from "@/lib/api/courses"
import { STATUS_GOOD } from "@/lib/dashboard/theme"

export function QuizSection({ course }: { course: CourseDetail }) {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingQuestion, setEditingQuestion] = React.useState<QuizQuestion | null>(null)
  const [removingQuestion, setRemovingQuestion] = React.useState<QuizQuestion | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const questions = course.quiz ? [...course.quiz.questions].sort((a, b) => a.displayOrder - b.displayOrder) : []
  const nextDisplayOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.displayOrder)) + 1 : 0

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["course", course.id] })
  }

  const reorderMutation = useMutation({
    mutationFn: async ({ a, b }: { a: QuizQuestion; b: QuizQuestion }) => {
      await updateQuestion(course.id, a.id, {
        prompt: a.prompt,
        displayOrder: b.displayOrder,
        options: a.options.map(({ text, isCorrect, displayOrder }) => ({ text, isCorrect, displayOrder })),
      })
      await updateQuestion(course.id, b.id, {
        prompt: b.prompt,
        displayOrder: a.displayOrder,
        options: b.options.map(({ text, isCorrect, displayOrder }) => ({ text, isCorrect, displayOrder })),
      })
    },
    onSuccess: invalidate,
    onError: (err) => setError(err instanceof ApiError ? err.message : "Não foi possível reordenar."),
  })

  const removeMutation = useMutation({
    mutationFn: (questionId: string) => removeQuestion(course.id, questionId),
    onSuccess: () => {
      invalidate()
      setRemovingQuestion(null)
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Não foi possível remover a questão."),
  })

  function moveQuestion(index: number, direction: -1 | 1) {
    const current = questions[index]
    const target = questions[index + direction]
    if (!current || !target) return
    setError(null)
    reorderMutation.mutate({ a: current, b: target })
  }

  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-[17px] font-semibold">Quiz</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingQuestion(null)
            setFormOpen(true)
          }}
          className="bg-[#C63C0B] hover:bg-[#B23509]"
        >
          <Plus className="h-4 w-4" />
          Adicionar questão
        </Button>
      </div>

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      {questions.length === 0 ? (
        <p className="mt-3 text-[13.5px] text-muted-foreground">Nenhuma questão ainda.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {questions.map((question, index) => (
            <div key={question.id} className="flex gap-3 border-t pt-3 first:border-t-0 first:pt-0">
              <ReorderButtons
                canMoveUp={index > 0}
                canMoveDown={index < questions.length - 1}
                onMoveUp={() => moveQuestion(index, -1)}
                onMoveDown={() => moveQuestion(index, 1)}
                disabled={reorderMutation.isPending}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13.5px] font-semibold">
                    {index + 1}. {question.prompt}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingQuestion(question)
                        setFormOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRemovingQuestion(question)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {[...question.options]
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((option) => (
                      <span
                        key={option.id}
                        className={
                          option.isCorrect
                            ? "inline-flex items-center gap-1 text-[12.5px] font-semibold text-foreground"
                            : "inline-flex items-center gap-1 text-[12.5px] text-muted-foreground"
                        }
                      >
                        {option.isCorrect ? <Check className="h-3.5 w-3.5" style={{ color: STATUS_GOOD }} /> : null}
                        {option.text}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuestionFormDialog
        courseId={course.id}
        question={editingQuestion}
        nextDisplayOrder={nextDisplayOrder}
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next)
          if (!next) setEditingQuestion(null)
        }}
      />

      <AlertDialog open={removingQuestion !== null} onOpenChange={(open) => !open && setRemovingQuestion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover essa questão?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{removingQuestion?.prompt}&quot; — essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                if (removingQuestion) removeMutation.mutate(removingQuestion.id)
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
