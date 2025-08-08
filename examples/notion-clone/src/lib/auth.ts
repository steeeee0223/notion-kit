import "server-only";

import { createAuth, createAuthEnv } from "@notion-kit/auth";

export const auth = createAuth(createAuthEnv());
