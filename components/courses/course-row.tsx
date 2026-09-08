import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { EntityImage } from "@/components/shared/entity-image"
import { CourseStatusBadge } from "@/components/courses/course-status-badge"
import type { CourseListItem } from "@/lib/api/courses"

export function CourseRow({ course }: { course: CourseListItem }) {
  return (
    <Link
      href={`/cursos/${course.id}`}
      className="flex items-center gap-4 border-t px-1 py-3.5 transition-colors first:border-t-0 hover:bg-muted/40"
    >
      <EntityImage src={course.coverImageUrl} alt={course.title} size="thumb" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold">{course.title}</span>
          <CourseStatusBadge status={course.status} />
        </div>
        <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{course.description}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
