import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { createAuth, createAuthEnv } from "@notion-kit/auth";

export const auth = createAuth(createAuthEnv());

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
