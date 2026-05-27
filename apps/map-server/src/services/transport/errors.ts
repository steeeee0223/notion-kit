import { ApiError } from "../../lib/api-error";

export type ProviderErrorCode =
  | "PROVIDER_NOT_FOUND"
  | "PROVIDER_DISABLED"
  | "MISSING_CREDENTIALS"
  | "UNSUPPORTED_CAPABILITY"
  | "UPSTREAM_UNAVAILABLE"
  | "SYNC_IN_PROGRESS"
  | "PARTIAL_DATA"
  | "STALE_DATA";

export class ProviderError extends ApiError {
  constructor(
    statusCode: number,
    code: ProviderErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(statusCode, code, message, details);
  }
}

export function providerNotFound(provider: string) {
  return new ProviderError(404, "PROVIDER_NOT_FOUND", "Provider not found", {
    provider,
  });
}

export function unsupportedCapability(provider: string, capability: string) {
  return new ProviderError(
    400,
    "UNSUPPORTED_CAPABILITY",
    "Provider does not support capability",
    { provider, capability },
  );
}

export function missingCredentials(provider: string, keys: string[]) {
  return new ProviderError(
    401,
    "MISSING_CREDENTIALS",
    "Provider credentials are missing",
    { provider, keys },
  );
}
