"use client"

import * as React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { CourseRow } from "@/components/courses/course-row"
import { CoursesSkeleton } from "@/components/courses/courses-skeleton"
import { CreateCourseDialog } from "@/components/courses/create-course-dialog"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { listCourses } from "@/lib/api/courses"
import { COURSE_STATUS_FILTER_OPTIONS } from "@/lib/courses/status"

const PAGE_SIZE = 20

export function CoursesView() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState("")

  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["courses", statusFilter],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listCourses({ cursor: pageParam, limit: PAGE_SIZE, status: statusFilter || undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const items = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[21px] font-semibold">Cursos</h1>
          {!isPending && !isError ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "curso" : "cursos"}
              {hasNextPage ? "+" : ""}
            </p>
          ) : null}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#C63C0B] hover:bg-[#B23509]">
          <Plus className="h-4 w-4" />
          Novo curso
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-[12.5px] font-semibold text-muted-foreground" htmlFor="course-status-filter">
          Status
        </label>
        <Select
          id="course-status-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-auto min-w-[180px]"
        >
          {COURSE_STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {isPending ? (
        <CoursesSkeleton />
      ) : isError ? (
        <DashboardError onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <h3 className="font-serif text-[17px] font-semibold">Nenhum curso ainda</h3>
          <p className="max-w-[40ch] text-[13.5px] text-muted-foreground">
            Crie o primeiro curso da plataforma pra começar a adicionar aulas.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="mt-1 bg-[#C63C0B] hover:bg-[#B23509]">
            <Plus className="h-4 w-4" />
            Novo curso
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border bg-background px-4">
            {items.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </div>
          {hasNextPage ? (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <CreateCourseDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
