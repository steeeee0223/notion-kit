import { createAuthClient } from "@notion-kit/auth";

import { env } from "@/env";

/**
 * Client
 */
export const authClient = createAuthClient(env.BETTER_AUTH_URL);
export const { useSession } = authClient;
