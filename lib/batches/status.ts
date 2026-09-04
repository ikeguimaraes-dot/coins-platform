import { STATUS_CRITICAL, STATUS_GOOD, STATUS_INFO, STATUS_NEUTRAL } from "@/lib/dashboard/theme"

export type BatchStatus = "PENDING" | "PAID" | "REJECTED" | "EXPIRED" | "CANCELED"

export const BATCH_STATUS: Record<BatchStatus, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: STATUS_INFO },
  PAID: { label: "Pago", color: STATUS_GOOD },
  REJECTED: { label: "Recusado", color: STATUS_CRITICAL },
  EXPIRED: { label: "Expirado", color: STATUS_NEUTRAL },
  CANCELED: { label: "Cancelado", color: STATUS_CRITICAL },
}

export const BATCH_STATUS_FILTER_OPTIONS: { value: BatchStatus | ""; label: string }[] = [
  { value: "PENDING", label: "Pendentes" },
  { value: "PAID", label: "Pagos" },
  { value: "REJECTED", label: "Recusados" },
  { value: "EXPIRED", label: "Expirados" },
  { value: "CANCELED", label: "Cancelados" },
  { value: "", label: "Todos" },
]
