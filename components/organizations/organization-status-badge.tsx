import { ORGANIZATION_STATUS, type OrganizationStatus } from "@/lib/organizations/status"

export function OrganizationStatusBadge({ status }: { status: OrganizationStatus }) {
  const meta = ORGANIZATION_STATUS[status]

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
