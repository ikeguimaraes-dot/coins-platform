"use client"

import * as React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/client"
import { addQuestion, updateQuestion, type QuizQuestion } from "@/lib/api/courses"

const optionSchema = z.object({
  text: z.string().min(1, "Informe o texto da alternativa"),
  isCorrect: z.boolean(),
})

const schema = z.object({
  prompt: z.string().min(1, "Informe o enunciado"),
  displayOrder: z
    .string()
    .min(1, "Informe a ordem")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, "Ordem inválida"),
  options: z
    .array(optionSchema)
    .min(2, "Adicione pelo menos 2 alternativas")
    .refine((options) => options.filter((option) => option.isCorrect).length === 1, {
      message: "Marque exatamente uma alternativa como correta",
    }),
})

type FormValues = z.infer<typeof schema>

function emptyOptions() {
  return [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ]
}

export function QuestionFormDialog({
  courseId,
  question,
  nextDisplayOrder,
  open,
  onOpenChange,
}: {
  courseId: string
  question: QuizQuestion | null
  nextDisplayOrder: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = React.useState<string | null>(null)
  const isEditing = question !== null

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prompt: "", displayOrder: String(nextDisplayOrder), options: emptyOptions() },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "options" })

  React.useEffect(() => {
    if (!open) return
    if (question) {
      const sortedOptions = [...question.options].sort((a, b) => a.displayOrder - b.displayOrder)
      form.reset({
        prompt: question.prompt,
        displayOrder: String(question.displayOrder),
        options: sortedOptions.map((option) => ({ text: option.text, isCorrect: option.isCorrect })),
      })
    } else {
      form.reset({ prompt: "", displayOrder: String(nextDisplayOrder), options: emptyOptions() })
    }
    setFormError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, question])

  function selectCorrect(index: number) {
    fields.forEach((_, i) => form.setValue(`options.${i}.isCorrect`, i === index))
  }

  function handleRemoveOption(index: number) {
    const wasCorrect = form.getValues(`options.${index}.isCorrect`)
    remove(index)
    if (wasCorrect) {
      const remaining = form.getValues("options")
      if (remaining.length > 0) form.setValue("options.0.isCorrect", true)
    }
  }

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const input = {
        prompt: values.prompt,
        displayOrder: Number(values.displayOrder),
        options: values.options.map((option, index) => ({
          text: option.text,
          isCorrect: option.isCorrect,
          displayOrder: index,
        })),
      }
      return isEditing ? updateQuestion(courseId, question.id, input) : addQuestion(courseId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] })
      onOpenChange(false)
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível salvar a questão.")
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate(values)
  })

  const watchedOptions = form.watch("options")
  const optionsError = form.formState.errors.options?.message ?? form.formState.errors.options?.root?.message

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar questão" : "Adicionar questão"}</DialogTitle>
          <DialogDescription>Marque qual alternativa é a correta.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium">Enunciado</label>
            <Textarea {...form.register("prompt")} rows={2} />
            {form.formState.errors.prompt ? (
              <p className="mt-1 text-[12px] text-destructive">{form.formState.errors.prompt.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-medium">Ordem</label>
            <Input {...form.register("displayOrder")} inputMode="numeric" className="max-w-[100px]" />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium">Alternativas</label>
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={watchedOptions[index]?.isCorrect ?? false}
                    onChange={() => selectCorrect(index)}
                    aria-label={`Alternativa ${index + 1} é a correta`}
                    className="h-4 w-4 shrink-0 accent-[#C63C0B]"
                  />
                  <Input
                    {...form.register(`options.${index}.text` as const)}
                    placeholder={`Alternativa ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    disabled={fields.length <= 2}
                    aria-label="Remover alternativa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {optionsError ? <p className="mt-1 text-[12px] text-destructive">{String(optionsError)}</p> : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ text: "", isCorrect: false })}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar alternativa
            </Button>
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending} className="bg-[#C63C0B] hover:bg-[#B23509]">
              {mutation.isPending ? "Salvando..." : isEditing ? "Salvar questão" : "Adicionar questão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
