"use client"

import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ReorderButtons({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  disabled,
}: {
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-5 w-6"
        onClick={onMoveUp}
        disabled={disabled || !canMoveUp}
        aria-label="Mover pra cima"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-5 w-6"
        onClick={onMoveDown}
        disabled={disabled || !canMoveDown}
        aria-label="Mover pra baixo"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
