"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { CourseDetailSkeleton } from "@/components/courses/course-detail-skeleton"
import { CourseEditForm } from "@/components/courses/course-edit-form"
import { CourseStatusBadge } from "@/components/courses/course-status-badge"
import { LessonsSection } from "@/components/courses/lessons-section"
import { QuizSection } from "@/components/courses/quiz-section"
import { PublishCourseButton } from "@/components/courses/publish-course-button"
import { EntityImage } from "@/components/shared/entity-image"
import { ApiError } from "@/lib/api/client"
import { getCourse } from "@/lib/api/courses"

export function CourseDetailView({ id }: { id: string }) {
  const [editing, setEditing] = React.useState(false)

  const {
    data: course,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourse(id),
  })

  const notFound = isError && error instanceof ApiError && error.status === 404

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/cursos"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Cursos
      </Link>

      {isPending ? (
        <CourseDetailSkeleton />
      ) : notFound ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h3 className="font-serif text-[17px] font-semibold">Curso não encontrado</h3>
          <p className="text-[13.5px] text-muted-foreground">Ele pode ter sido removido ou o link está incorreto.</p>
        </div>
      ) : isError || !course ? (
        <DashboardError onRetry={() => refetch()} />
      ) : (
        <>
          <EntityImage src={course.coverImageUrl} alt={course.title} size="large" />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-[24px] font-semibold">{course.title}</h1>
                <CourseStatusBadge status={course.status} />
              </div>
              <p className="mt-1 max-w-[60ch] text-[13.5px] text-muted-foreground">{course.description}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Editar
                </Button>
              ) : null}
              <PublishCourseButton course={course} />
            </div>
          </div>

          {editing ? <CourseEditForm course={course} onDone={() => setEditing(false)} /> : null}

          <LessonsSection course={course} />
          <QuizSection course={course} />
        </>
      )}
    </div>
  )
}
