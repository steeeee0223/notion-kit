import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient as createReactClient } from "better-auth/react";

import type { Auth } from "./auth";

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
    plugins: [
      inferAdditionalFields<Auth>({
        user: {
          preferredName: { type: "string" },
          lang: { type: "string", defaultValue: "en" },
        },
      }),
    ],
  });
}
export type AuthClient = ReturnType<typeof createAuthClient>;
