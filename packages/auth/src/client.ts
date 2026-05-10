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
import {
  emojiClient,
  fileUploadClient,
  organizationExtraClient,
  stripeExtraClient,
} from "@/lib/plugins";
import {
  additionalSessionFields,
  additionalTeamFields,
  additionalUserFields,
} from "@/lib/utils";

interface CreateAuthClientOptions {
  baseURL?: string;
  basePath?: string;
}

function normalizeOptions(
  options?: string | CreateAuthClientOptions,
): CreateAuthClientOptions {
  if (typeof options === "string") {
    return options.startsWith("/")
      ? { basePath: options }
      : { baseURL: options, basePath: "/api/auth" };
  }
  return {
    baseURL: options?.baseURL,
    basePath: options?.basePath ?? "/api/auth",
  };
}

export function createAuthClient(options?: string | CreateAuthClientOptions) {
  const { baseURL, basePath } = normalizeOptions(options);
  return createReactClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL,
    basePath,
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
      organizationExtraClient(),
      emojiClient(),
      fileUploadClient(),
    ],
  });
}
export type AuthClient = ReturnType<typeof createAuthClient>;
