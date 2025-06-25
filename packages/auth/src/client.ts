import {
  inferAdditionalFields,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient as createReactClient } from "better-auth/react";

import type { Auth } from "./auth";

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
      twoFactorClient(),
      passkeyClient(),
    ],
  });
}
export type AuthClient = ReturnType<typeof createAuthClient>;
