import { createAuthClient as createReactClient } from "better-auth/react";

export * from "./auth";
export * from "./env";

export { APIError as AuthError } from "better-auth/api";
/** For Nextjs Server */
export { toNextJsHandler } from "better-auth/next-js";

/** For React Client */
export function createAuthClient(baseURL?: string) {
  return createReactClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL,
  });
}
export type AuthClient = ReturnType<typeof createAuthClient>;
