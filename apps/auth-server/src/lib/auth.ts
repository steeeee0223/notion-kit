import { waitUntil } from "@vercel/functions";

import { createAuth, createAuthEnv } from "@notion-kit/auth";

export const authEnv = createAuthEnv();
export const auth = createAuth(authEnv, {
  backgroundTasks: { handler: waitUntil },
});
