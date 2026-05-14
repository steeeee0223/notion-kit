import { createAuth, createAuthEnv } from "@notion-kit/auth";

export const auth = createAuth(createAuthEnv(), { basePath: "/api/auth" });
