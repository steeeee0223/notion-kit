import { passkeyClient } from "@better-auth/passkey/client";
import { stripeClient } from "@better-auth/stripe/client";
import {
  inferAdditionalFields,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import {
  createAuthClient as createReactClient,
  type ReactAuthClient,
} from "better-auth/react";

import type { Auth } from "@/auth";
import { roles } from "@/lib/permissions";
import {
  emojiClient,
  fileUploadClient,
  organizationExtraClient,
  stripeExtraClient,
} from "@/lib/plugins";
import { additionalTeamFields, additionalUserFields } from "@/lib/utils";

interface CreateAuthClientOptions {
  baseURL?: string;
  basePath?: string;
}

const organizationOptions = {
  roles,
  teams: { enabled: true },
  schema: { team: { additionalFields: additionalTeamFields } },
} as const;

type ClientPlugins = [
  ReturnType<typeof inferAdditionalFields<Auth>>,
  ReturnType<typeof twoFactorClient>,
  ReturnType<typeof passkeyClient>,
  ReturnType<typeof organizationClient<typeof organizationOptions>>,
  ReturnType<typeof stripeClient<{ subscription: true }>>,
  ReturnType<typeof stripeExtraClient>,
  ReturnType<typeof organizationExtraClient>,
  ReturnType<typeof emojiClient>,
  ReturnType<typeof fileUploadClient>,
];

export type AuthClient = ReactAuthClient<
  CreateAuthClientOptions & { plugins: ClientPlugins }
>;

export function createAuthClient({
  baseURL,
  basePath = "/api/auth",
}: CreateAuthClientOptions = {}): AuthClient {
  const plugins: ClientPlugins = [
    inferAdditionalFields<Auth>({ user: additionalUserFields }),
    twoFactorClient(),
    passkeyClient(),
    organizationClient(organizationOptions),
    stripeClient({ subscription: true }),
    stripeExtraClient(),
    organizationExtraClient(),
    emojiClient(),
    fileUploadClient(),
  ];
  return createReactClient({ baseURL, basePath, plugins });
}
