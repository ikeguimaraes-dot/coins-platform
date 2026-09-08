import { COURSE_STATUS, type CourseStatus } from "@/lib/courses/status"

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  const meta = COURSE_STATUS[status]

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-foreground"
      style={{ backgroundColor: `${meta.color}1A` }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  )
}
