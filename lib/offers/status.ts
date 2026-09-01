import { STATUS_GOOD, STATUS_NEUTRAL } from "@/lib/dashboard/theme"

export type OfferStatus = "ACTIVE" | "INACTIVE"

export const OFFER_STATUS: Record<OfferStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Ativa", color: STATUS_GOOD },
  INACTIVE: { label: "Inativa", color: STATUS_NEUTRAL },
}

export const OFFER_STATUS_OPTIONS: { value: OfferStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativa" },
  { value: "INACTIVE", label: "Inativa" },
]
