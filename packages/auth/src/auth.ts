import { passkey } from "@better-auth/passkey";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, organization, twoFactor } from "better-auth/plugins";

import { db, updateSessionData } from "./db";
import { AuthEnv } from "./env";
import {
  ac,
  additionalSessionFields,
  additionalTeamFields,
  additionalUserFields,
  createMailtrapApi,
  roles,
  sendEmail,
} from "./lib";

export function createAuth(env: AuthEnv) {
  const mailApi = createMailtrapApi(env.MAILTRAP_API_KEY);

  const config = {
    appName: "Notion Auth",
    database: drizzleAdapter(db, { provider: "pg" }),
    trustedOrigins: [env.BETTER_AUTH_URL, ...env.TRUSTED_ORIGINS],
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
        update: { after: updateSessionData },
      },
    },
    plugins: [
      twoFactor(),
      passkey({ rpName: "Notion Auth" }),
      organization({
        ac,
        roles,
        cancelPendingInvitationsOnReInvite: true,
        sendInvitationEmail: async ({ id, email, inviter, organization }) => {
          const inviteLink = `${env.BETTER_AUTH_URL}/accept-invitation/${id}`;
          await sendEmail(mailApi, env.MAILTRAP_INBOX_ID ?? "", {
            from: { email: inviter.user.email, name: inviter.user.name },
            to: [{ email }],
            subject: `You're invited to join ${organization.name}`,
            text: `${inviter.user.name} has invited you to join ${organization.name}. Please click the link below to accept the invitation:\n\n${inviteLink}\n\nBest,\nSteeeee at WorXpace`,
          });
        },
        teams: {
          enabled: true,
          maximumTeams: 10, // Optional: limit teams per organization
          allowRemovingAllTeams: true, // Optional: prevent removing the last team
        },
        schema: {
          team: { additionalFields: additionalTeamFields },
        },
      }),
      openAPI(),
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
