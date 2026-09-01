function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-t px-1 py-3.5 first:border-t-0">
      <div className="h-14 w-14 shrink-0 animate-dashboard-shimmer rounded-xl" />
      <div className="flex-1">
        <div className="h-4 w-48 animate-dashboard-shimmer rounded" />
        <div className="mt-2 h-3 w-32 animate-dashboard-shimmer rounded" />
      </div>
      <div className="hidden h-6 w-20 animate-dashboard-shimmer rounded sm:block" />
    </div>
  )
}

export function OffersSkeleton() {
  return (
    <div className="rounded-2xl border bg-background px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
