import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { passkey, type Passkey } from "better-auth/plugins/passkey";

import { db, updateAccountName, updateSessionData } from "./db";
import { AuthEnv } from "./env";
import { additionalSessionFields, additionalUserFields } from "./lib";

export function createAuth(env: AuthEnv) {
  const config = {
    appName: "Notion Auth",
    database: drizzleAdapter(db, { provider: "pg" }),
    trustedOrigins: [
      env.BETTER_AUTH_URL,
      ...(env.TRUSTED_ORIGIN ? [env.TRUSTED_ORIGIN] : []),
    ],
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: ({ user, url }) => {
          console.log(
            `Send change email verification to ${user.email} with URL: ${url}`,
          );
          return Promise.resolve();
        },
      },
      deleteUser: { enabled: true },
      additionalFields: additionalUserFields,
    },
    session: {
      additionalFields: additionalSessionFields,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: ({ user, url }) => {
        console.log(
          `Send email verification to ${user.email} with URL: ${url}`,
        );
        return Promise.resolve();
      },
    },
    emailAndPassword: {
      enabled: true,
      /**
       * @default true
       */
      requireEmailVerification: false,
    },
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        prompt: "select_account",
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    databaseHooks: {
      session: {
        create: { after: updateSessionData },
      },
      account: {
        create: { after: updateAccountName },
        update: { after: updateAccountName },
      },
    },
    plugins: [twoFactor(), passkey({ rpName: "Notion Auth" })],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
export type { Passkey };
