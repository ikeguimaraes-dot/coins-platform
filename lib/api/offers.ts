import { apiClient } from "@/lib/api/client"
import type { components } from "@/src/types/api"

export type OfferListItem = components["schemas"]["OfferListResponseDto"]["items"][number]
export type OfferSummary = components["schemas"]["OfferSummaryDto"]
export type CreateOfferInput = components["schemas"]["CreateOfferDto"]
export type UpdateOfferInput = components["schemas"]["UpdatePlatformOfferDto"]

export type OffersPage = {
  items: OfferListItem[]
  nextCursor: string | null
}

export function listOffers(params: { cursor?: string; limit?: number; partnerId?: string } = {}) {
  const query = new URLSearchParams()
  if (params.cursor) query.set("cursor", params.cursor)
  if (params.limit) query.set("limit", String(params.limit))
  if (params.partnerId) query.set("partnerId", params.partnerId)
  const qs = query.toString()
  return apiClient.get<OffersPage>(`/platform/offers${qs ? `?${qs}` : ""}`)
}

export function createOffer(input: CreateOfferInput) {
  return apiClient.post<OfferSummary>("/platform/offers", input)
}

export function getOffer(id: string) {
  return apiClient.get<OfferSummary>(`/platform/offers/${id}`)
}

export function updateOffer(id: string, input: UpdateOfferInput) {
  return apiClient.patch<OfferSummary>(`/platform/offers/${id}`, input)
}
