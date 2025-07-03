import {
  inferAdditionalFields,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient as createReactClient } from "better-auth/react";

import type { Auth } from "./auth";
import { additionalSessionFields, additionalUserFields } from "./lib";

export function createAuthClient(baseURL?: string) {
  return createReactClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL,
    plugins: [
      inferAdditionalFields<Auth>({
        user: additionalUserFields,
        session: additionalSessionFields,
      }),
      twoFactorClient(),
      passkeyClient(),
    ],
  });
}
export type AuthClient = ReturnType<typeof createAuthClient>;
