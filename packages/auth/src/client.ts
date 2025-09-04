import {
  inferAdditionalFields,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient as createReactClient } from "better-auth/react";

import type { Auth } from "./auth";
import {
  ac,
  additionalSessionFields,
  additionalTeamFields,
  additionalUserFields,
  roles,
} from "./lib";

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
      organizationClient({
        ac,
        roles,
        teams: { enabled: true },
        schema: {
          team: { additionalFields: additionalTeamFields },
        },
      }),
    ],
  });
}
export type AuthClient = ReturnType<typeof createAuthClient>;
