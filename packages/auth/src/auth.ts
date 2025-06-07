import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";
import { AuthEnv } from "./env";

export function createAuth(env: AuthEnv) {
  const config = {
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // default: true
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
