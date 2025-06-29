import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { Resend } from "resend";

import { db } from "./db";
import { sendChangeEmailVerification } from "./email";
import { AuthEnv } from "./env";

export function createAuth(env: AuthEnv) {
  const resend = new Resend(env.RESEND_API_KEY);

  const config = {
    appName: "Notion Auth",
    database: drizzleAdapter(db, { provider: "pg" }),
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: ({ user, url }) =>
          sendChangeEmailVerification(resend, user.email, url),
      },
      deleteUser: { enabled: true },
      additionalFields: {
        preferredName: { type: "string", required: false },
        lang: { type: "string", required: false, defaultValue: "en" },
      },
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
    plugins: [
      twoFactor(),
      passkey({
        rpName: "Notion Auth",
      }),
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
