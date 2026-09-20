"use client";

import { useMemo } from "react";
import { z } from "zod/v4";

import { locales } from "@notion-kit/i18n";
import type { AccountAdapter, AccountStore } from "@notion-kit/settings-panel";

import { useAuth, useSession } from "../auth-provider";
import { resolveAppURL } from "../lib/app-url";

export function useAccountAdapter(): AccountAdapter | undefined {
  const { appURL, auth } = useAuth();
  const { data: session } = useSession();

  return useMemo<AccountAdapter | undefined>(() => {
    if (!session) return undefined;
    return {
      getAll: async (): Promise<AccountStore> => {
        const [result, currentSession] = await Promise.all([
          auth.listAccounts(),
          auth.getSession({ query: { disableCookieCache: true } }),
        ]);
        if (currentSession.error) throw new Error(currentSession.error.message);
        if (!currentSession.data) throw new Error("Session expired");
        const session = currentSession.data;
        if (result.error) throw new Error(result.error.message);
        return {
          hasPassword: result.data.some(
            (account) => account.providerId === "credential",
          ),
          id: session.user.id,
          name: session.user.name,
          preferredName: session.user.preferredName?.length
            ? session.user.preferredName
            : session.user.name,
          email: session.user.email,
          avatarUrl: session.user.image ?? "",
          language: z.enum(locales).optional().parse(session.user.lang),
          currentSessionId: session.session.id,
          timezone: session.user.tz ?? undefined,
        };
      },
      update: async (data) => {
        await auth.updateUser(
          {
            name: data.name,
            image: data.avatarUrl,
            preferredName: data.preferredName,
            lang: data.language,
            tz: data.timezone,
          },
          { throw: true },
        );
      },
      delete: async () => {
        await auth.deleteUser(
          { callbackURL: resolveAppURL(appURL, "/") },
          { throw: true },
        );
      },
      sendEmailVerification: async (email) => {
        await auth.sendVerificationEmail(
          { email, callbackURL: resolveAppURL(appURL, "/") },
          { throw: true },
        );
      },
      changePassword: async (data) => {
        await auth.changePassword(
          { ...data, revokeOtherSessions: true },
          { throw: true },
        );
      },
    };
  }, [appURL, auth, session]);
}
