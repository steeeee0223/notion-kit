import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { openAPI, organization, twoFactor } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { createDatabase } from "@/db/db";
import { member } from "@/db/schemas";
import { createSupabaseStorage } from "@/db/supabase";
import { stringListSchema, type AuthEnv } from "@/env";
import { createAuthEmailSender } from "@/lib/email";
import { roles } from "@/lib/permissions";
import {
  emoji,
  fileUpload,
  organizationExtra,
  stripeExtra,
} from "@/lib/plugins";
import { additionalTeamFields, additionalUserFields } from "@/lib/utils";

interface CreateAuthOptions {
  basePath?: string;
  backgroundTasks?: NonNullable<
    BetterAuthOptions["advanced"]
  >["backgroundTasks"];
}

export function createAuth(env: AuthEnv, options: CreateAuthOptions = {}) {
  const appUrl = env.APP_URL ?? env.BETTER_AUTH_URL;
  const trustedOrigins = [
    ...new Set([
      new URL(env.BETTER_AUTH_URL).origin,
      new URL(appUrl).origin,
      ...stringListSchema.parse(env.TRUSTED_ORIGINS),
    ]),
  ];
  const db = createDatabase(env.POSTGRES_URL);
  const sendEmail = createAuthEmailSender(env);
  const stripeClient = env.STRIPE_SECRET_KEY
    ? new Stripe(env.STRIPE_SECRET_KEY)
    : undefined;
  const supabaseStorage =
    env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY
      ? createSupabaseStorage(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)
      : undefined;

  const config = {
    appName: "Notion Auth",
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: options.basePath ?? "/api/auth",
    advanced: {
      backgroundTasks: options.backgroundTasks,
      ipAddress: { ipAddressHeaders: ["x-auth-client-ip"] },
    },
    database: drizzleAdapter(db, { provider: "pg" }),
    trustedOrigins,
    rateLimit: { storage: "database" },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: ({ user, newEmail, url }) =>
          sendEmail({
            template: "change-email",
            to: user.email,
            variables: {
              confirmationLink: url,
              currentEmail: user.email,
              newEmail,
            },
          }),
      },
      deleteUser: { enabled: true },
      additionalFields: additionalUserFields,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: ({ user, url }) =>
        sendEmail({
          template: "verify-email",
          to: user.email,
          variables: {
            verificationUrl: url,
            userEmail: user.email,
            userName: user.name,
          },
        }),
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, url }) =>
        sendEmail({
          template: "reset-password",
          to: user.email,
          variables: { resetLink: url, userEmail: user.email },
        }),
    },
    account: {
      encryptOAuthTokens: true,
      accountLinking: {
        enabled: true,
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
        create: {
          before: async (session) => {
            const membership = await db.query.member.findFirst({
              where: eq(member.userId, session.userId),
            });
            return {
              data: {
                ...session,
                activeOrganizationId: membership?.organizationId,
              },
            };
          },
        },
      },
    },
    plugins: [
      twoFactor(),
      passkey({
        rpName: "Notion Auth",
        rpID: env.PASSKEY_RP_ID,
        origin: trustedOrigins,
      }),
      organization({
        roles,
        cancelPendingInvitationsOnReInvite: true,
        sendInvitationEmail: async (
          { id, email, inviter, organization, role },
          request,
        ) => {
          const origin = request?.headers.get("origin");
          const destination =
            origin && trustedOrigins.includes(origin) ? origin : appUrl;
          await sendEmail({
            template: "invitation",
            to: email,
            variables: {
              inviteLink: new URL(
                `/accept-invitation/${encodeURIComponent(id)}`,
                destination,
              ).href,
              inviterName: inviter.user.name,
              inviterEmail: inviter.user.email,
              organizationName: organization.name,
              role,
            },
          });
        },
        organizationHooks: {
          beforeCreateTeam: ({ user, team }) => {
            if (!user) throw new APIError("UNAUTHORIZED");
            return Promise.resolve({ data: { ...team, ownedBy: user.id } });
          },
        },
        teams: {
          enabled: true,
          defaultTeam: { enabled: false },
          maximumTeams: 10, // Optional: limit teams per organization
          allowRemovingAllTeams: true, // Optional: prevent removing the last team
        },
        schema: {
          team: { additionalFields: additionalTeamFields },
        },
      }),
      openAPI(),
      organizationExtra({
        db,
        billingEnabled: !!stripeClient && !!env.STRIPE_WEBHOOK_SECRET,
      }),
      ...(stripeClient && env.STRIPE_WEBHOOK_SECRET
        ? [
            stripe({
              stripeClient,
              stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
              createCustomerOnSignUp: true,
              subscription: {
                enabled: true,
                plans: env.STRIPE_PLANS ?? [],
                authorizeReference: async ({ user, referenceId }) => {
                  const membership = await db.query.member.findFirst({
                    where: (m, { and, eq }) =>
                      and(
                        eq(m.organizationId, referenceId),
                        eq(m.userId, user.id),
                      ),
                  });
                  return (
                    membership?.role
                      .split(",")
                      .some((role) => role === "owner" || role === "admin") ??
                    false
                  );
                },
              },
              organization: { enabled: true },
            }),
            stripeExtra({ stripeClient }),
          ]
        : []),
      ...(supabaseStorage
        ? [
            emoji({ db, storage: supabaseStorage }),
            fileUpload({ storage: supabaseStorage }),
          ]
        : []),
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
