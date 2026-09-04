import { apiClient } from "@/lib/api/client"
import type { components } from "@/src/types/api"

export type OrganizationListItem = components["schemas"]["OrganizationListResponseDto"]["items"][number]
export type OrganizationSummary = components["schemas"]["OrganizationSummaryDto"]
export type CreateOrganizationInput = components["schemas"]["CreateOrganizationDto"]
export type CreateOrganizationResponse = components["schemas"]["CreateOrganizationResponseDto"]
export type UpdateOrganizationInput = components["schemas"]["UpdatePlatformOrganizationDto"]
export type ConversionRate = components["schemas"]["ConversionRateSummaryDto"]

export type OrganizationsPage = {
  items: OrganizationListItem[]
  nextCursor: string | null
}

export function listOrganizations(params: { cursor?: string; limit?: number; q?: string } = {}) {
  const query = new URLSearchParams()
  if (params.cursor) query.set("cursor", params.cursor)
  if (params.limit) query.set("limit", String(params.limit))
  if (params.q) query.set("q", params.q)
  const qs = query.toString()
  return apiClient.get<OrganizationsPage>(`/platform/organizations${qs ? `?${qs}` : ""}`)
}

export function createOrganization(input: CreateOrganizationInput) {
  return apiClient.post<CreateOrganizationResponse>("/platform/organizations", input)
}

export function getOrganization(id: string) {
  return apiClient.get<OrganizationSummary>(`/platform/organizations/${id}`)
}

export function updateOrganization(id: string, input: UpdateOrganizationInput) {
  return apiClient.patch<OrganizationSummary>(`/platform/organizations/${id}`, input)
}

export function updateConversionRate(id: string, coinsPerReal: number) {
  return apiClient.patch<ConversionRate>(`/platform/organizations/${id}/conversion-rate`, { coinsPerReal })
}
