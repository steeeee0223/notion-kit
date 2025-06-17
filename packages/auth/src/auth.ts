import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";

import { db } from "./db";
import { sendChangeEmailVerification } from "./email";
import { AuthEnv } from "./env";

export function createAuth(env: AuthEnv) {
  const resend = new Resend(env.RESEND_API_KEY);

  const config = {
    database: drizzleAdapter(db, { provider: "pg" }),
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: ({ user, url }) =>
          sendChangeEmailVerification(resend, user.email, url),
      },
      deleteUser: { enabled: true },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: ({ user, url }) =>
        sendChangeEmailVerification(resend, user.email, url),
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
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
