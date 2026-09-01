import { STATUS_GOOD, STATUS_NEUTRAL } from "@/lib/dashboard/theme"

export type PartnerStatus = "ACTIVE" | "INACTIVE"

export const PARTNER_STATUS: Record<PartnerStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: STATUS_GOOD },
  INACTIVE: { label: "Inativo", color: STATUS_NEUTRAL },
}

export const PARTNER_STATUS_OPTIONS: { value: PartnerStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
]
