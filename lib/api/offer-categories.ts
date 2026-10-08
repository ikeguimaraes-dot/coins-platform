import { apiClient } from "@/lib/api/client"
import type { components } from "@/src/types/api"

export type OfferCategory = components["schemas"]["OfferCategoryResponseDto"]
export type CreateOfferCategoryInput = components["schemas"]["CreateOfferCategoryDto"]
export type UpdateOfferCategoryInput = components["schemas"]["UpdateOfferCategoryDto"]

type OfferCategoryList = components["schemas"]["OfferCategoryListResponseDto"]

export function listOfferCategories({ includeInactive = false }: { includeInactive?: boolean } = {}) {
  const query = includeInactive ? "?includeInactive=true" : ""
  return apiClient.get<OfferCategoryList>(`/platform/offer-categories${query}`)
}

export function createOfferCategory(input: CreateOfferCategoryInput) {
  return apiClient.post<OfferCategory>("/platform/offer-categories", input)
}

export function updateOfferCategory(id: string, input: UpdateOfferCategoryInput) {
  return apiClient.patch<OfferCategory>(`/platform/offer-categories/${id}`, input)
}

export function deleteOfferCategory(id: string) {
  return apiClient.delete<void>(`/platform/offer-categories/${id}`)
}
