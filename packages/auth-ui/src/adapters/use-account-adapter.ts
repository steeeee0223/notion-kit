"use client";

import { useMemo } from "react";

import type { AccountAdapter, AccountStore } from "@notion-kit/settings-panel";

import { useAuth, useSession } from "../auth-provider";

export function useAccountAdapter(): AccountAdapter | undefined {
  const { auth } = useAuth();
  const { data: session } = useSession();

  return useMemo<AccountAdapter | undefined>(() => {
    if (!session) return undefined;
    return {
      getAll: (): Promise<AccountStore> =>
        Promise.resolve({
          hasPassword: true,
          id: session.user.id,
          name: session.user.name,
          preferredName: session.user.preferredName || session.user.name,
          email: session.user.email,
          avatarUrl: session.user.image ?? "",
          language: session.user.lang as AccountStore["language"],
          currentSessionId: session.session.id,
          timezone: session.user.tz ?? undefined,
        }),
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
        await auth.deleteUser({ callbackURL: "/" }, { throw: true });
      },
      sendEmailVerification: async (email) => {
        await auth.sendVerificationEmail({ email }, { throw: true });
      },
      changePassword: async (data) => {
        await auth.changePassword(
          { ...data, revokeOtherSessions: true },
          { throw: true },
        );
      },
    };
  }, [auth, session]);
}
