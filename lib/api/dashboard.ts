import { apiClient } from "@/lib/api/client"
import type { components } from "@/src/types/api"

export type PlatformDashboard = components["schemas"]["PlatformDashboardResponseDto"]

export function getPlatformDashboard() {
  return apiClient.get<PlatformDashboard>("/platform/dashboard")
}
