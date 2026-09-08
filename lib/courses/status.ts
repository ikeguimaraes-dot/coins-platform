import { STATUS_GOOD, STATUS_NEUTRAL } from "@/lib/dashboard/theme"

export type CourseStatus = "DRAFT" | "PUBLISHED"

export const COURSE_STATUS: Record<CourseStatus, { label: string; color: string }> = {
  DRAFT: { label: "Rascunho", color: STATUS_NEUTRAL },
  PUBLISHED: { label: "Publicado", color: STATUS_GOOD },
}

export const COURSE_STATUS_FILTER_OPTIONS: { value: CourseStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "DRAFT", label: "Rascunhos" },
  { value: "PUBLISHED", label: "Publicados" },
]
