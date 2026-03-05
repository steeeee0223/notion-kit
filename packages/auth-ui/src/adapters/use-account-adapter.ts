"use client";

import { useMemo } from "react";

import type { AccountAdapter } from "@notion-kit/settings-panel";

import { useAuth } from "../auth-provider";

export function useAccountAdapter(): AccountAdapter {
  const { auth } = useAuth();

  return useMemo<AccountAdapter>(
    () => ({
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
    }),
    [auth],
  );
}
