import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";
import { AuthEnv } from "./env";

export function createAuth(env: AuthEnv) {
  const config = {
    database: drizzleAdapter(db, { provider: "pg" }),
    user: {
      changeEmail: {
        enabled: true,
        // sendChangeEmailVerification: async ({ user, newEmail, url, token }, request) => {
        //     await ({
        //         to: user.email, // verification email must be sent to the current user email to approve the change
        //         subject: 'Approve email change',
        //         text: `Click the link to approve the change: ${url}`
        //     })
        // }
      },
      deleteUser: { enabled: true },
    },
    emailVerification: {},
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true, // default: true
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
