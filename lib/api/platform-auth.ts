import type { components } from "@/src/types/api"

export type PlatformLoginResponse = components["schemas"]["PlatformAdminLoginResponseDto"]
export type TokenPair = components["schemas"]["PlatformAdminTokenPairDto"]
export type MfaSetupResponse = components["schemas"]["PlatformAdminMfaSetupResponseDto"]
export type PlatformAdminProfile = components["schemas"]["PlatformAdminProfileDto"]

export type LoginStep = "mfa_verify" | "mfa_setup"

export function loginStepFromStatus(status: PlatformLoginResponse["status"]): LoginStep {
  return status === "MFA_SETUP_REQUIRED" ? "mfa_setup" : "mfa_verify"
}
