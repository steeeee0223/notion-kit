import { passkeyClient } from "@better-auth/passkey/client";
import { stripeClient } from "@better-auth/stripe/client";
import {
  inferAdditionalFields,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient as createReactClient } from "better-auth/react";

import type { Auth } from "@/auth";
import { ac, roles } from "@/lib/permissions";
import { stripeExtraClient } from "@/lib/plugins";
import {
  additionalSessionFields,
  additionalTeamFields,
  additionalUserFields,
} from "@/lib/utils";

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
      stripeClient({ subscription: true }),
      stripeExtraClient(),
    ],
  });
}
export type AuthClient = ReturnType<typeof createAuthClient>;
