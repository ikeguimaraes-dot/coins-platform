import { apiClient } from "@/lib/api/client"
import type { components } from "@/src/types/api"

export type PartnerListItem = components["schemas"]["PartnerListResponseDto"]["items"][number]
export type PartnerSummary = components["schemas"]["PartnerSummaryDto"]
export type CreatePartnerInput = components["schemas"]["CreatePartnerDto"]
export type CreatePartnerResponse = components["schemas"]["CreatePartnerResponseDto"]
export type UpdatePartnerInput = components["schemas"]["UpdatePlatformPartnerDto"]
export type ResetPartnerPasswordResponse = components["schemas"]["ResetPartnerPasswordResponseDto"]

export type PartnersPage = {
  items: PartnerListItem[]
  nextCursor: string | null
}

export function listPartners(params: { cursor?: string; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.cursor) query.set("cursor", params.cursor)
  if (params.limit) query.set("limit", String(params.limit))
  const qs = query.toString()
  return apiClient.get<PartnersPage>(`/platform/partners${qs ? `?${qs}` : ""}`)
}

export function createPartner(input: CreatePartnerInput) {
  return apiClient.post<CreatePartnerResponse>("/platform/partners", input)
}

export function getPartner(id: string) {
  return apiClient.get<PartnerSummary>(`/platform/partners/${id}`)
}

export function updatePartner(id: string, input: UpdatePartnerInput) {
  return apiClient.patch<PartnerSummary>(`/platform/partners/${id}`, input)
}

export function resetPartnerPassword(id: string) {
  return apiClient.post<ResetPartnerPasswordResponse>(`/platform/partners/${id}/reset-password`)
}
