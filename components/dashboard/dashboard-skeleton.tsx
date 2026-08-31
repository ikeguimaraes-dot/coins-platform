function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-dashboard-shimmer rounded-2xl ${className ?? ""}`} />
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[104px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[176px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[208px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[208px]" />
        ))}
      </div>
    </div>
  )
}
