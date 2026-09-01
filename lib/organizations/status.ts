import { STATUS_CRITICAL, STATUS_GOOD, STATUS_WARNING } from "@/lib/dashboard/theme"

export type OrganizationStatus = "ACTIVE" | "SUSPENDED" | "CANCELED"

export const ORGANIZATION_STATUS: Record<OrganizationStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Ativa", color: STATUS_GOOD },
  SUSPENDED: { label: "Suspensa", color: STATUS_WARNING },
  CANCELED: { label: "Cancelada", color: STATUS_CRITICAL },
}

export const ORGANIZATION_STATUS_OPTIONS: { value: OrganizationStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativa" },
  { value: "SUSPENDED", label: "Suspensa" },
  { value: "CANCELED", label: "Cancelada" },
]
