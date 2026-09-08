export function CourseDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-7 w-64 animate-dashboard-shimmer rounded" />
      <div className="aspect-[16/9] w-full animate-dashboard-shimmer rounded-2xl" />
      <div className="h-24 animate-dashboard-shimmer rounded-2xl" />
      <div className="h-40 animate-dashboard-shimmer rounded-2xl" />
      <div className="h-40 animate-dashboard-shimmer rounded-2xl" />
    </div>
  )
}
