export function OrganizationDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-7 w-64 animate-dashboard-shimmer rounded" />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="h-24 animate-dashboard-shimmer rounded-2xl" />
        <div className="h-24 animate-dashboard-shimmer rounded-2xl" />
        <div className="h-24 animate-dashboard-shimmer rounded-2xl" />
      </div>
      <div className="h-40 animate-dashboard-shimmer rounded-2xl" />
    </div>
  )
}
