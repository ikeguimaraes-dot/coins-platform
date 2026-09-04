import { apiClient } from "@/lib/api/client"
import type { components } from "@/src/types/api"

export type BatchListItem = components["schemas"]["PlatformBatchListResponseDto"]["items"][number]
export type BatchItem = components["schemas"]["PlatformBatchItemDto"]

export type BatchesPage = {
  items: BatchListItem[]
  nextCursor: string | null
}

export function listBatches(params: { cursor?: string; limit?: number; status?: string } = {}) {
  const query = new URLSearchParams()
  if (params.cursor) query.set("cursor", params.cursor)
  if (params.limit) query.set("limit", String(params.limit))
  if (params.status) query.set("status", params.status)
  const qs = query.toString()
  return apiClient.get<BatchesPage>(`/platform/batches${qs ? `?${qs}` : ""}`)
}

export function approveBatch(id: string) {
  return apiClient.post<BatchItem>(`/platform/batches/${id}/approve`)
}

export function rejectBatch(id: string, reason?: string) {
  return apiClient.post<BatchItem>(`/platform/batches/${id}/reject`, reason ? { reason } : {})
}
