"use client";

import { useMemo } from "react";

import type { AccountStore, SettingsActions } from "@notion-kit/settings-panel";

import { useAuth, useSession } from "../auth-provider";
import { handleError } from "../lib";
import {
  deleteConnection,
  linkAccount,
  loadConnections,
  transferPasskeys,
  transferSessions,
} from "./utils";

const initialAccountStore: AccountStore = {
  hasPassword: false,
  id: "",
  name: "",
  preferredName: "",
  email: "",
  avatarUrl: "",
  language: "en",
  currentSessionId: "",
};

export function useAccountSettings() {
  const { auth } = useAuth();
  const { data } = useSession();

  const accountStore = useMemo<AccountStore>(() => {
    if (!data) return initialAccountStore;
    return {
      hasPassword: true,
      id: data.user.id,
      name: data.user.name,
      preferredName: data.user.preferredName || data.user.name,
      email: data.user.email,
      avatarUrl: data.user.image ?? "",
      language: data.user.lang as AccountStore["language"],
      currentSessionId: data.session.id,
      timezone: data.user.tz ?? undefined,
    };
  }, [data]);

  const actions = useMemo<SettingsActions>(() => {
    return {
      account: {
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
      },
      sessions: {
        getAll: async () => {
          const result = await auth.listSessions();
          if (result.error) {
            handleError(result, "Fetch sessions error");
            return [];
          }
          return transferSessions(result.data);
        },
        delete: async (token) => {
          await auth.revokeSession({ token }, { throw: true });
        },
        deleteAll: async () => {
          await auth.revokeOtherSessions(undefined, { throw: true });
        },
      },
      passkeys: {
        getAll: async () => {
          const result = await auth.passkey.listUserPasskeys();
          return transferPasskeys(result.data);
        },
        add: async () => {
          const result = await auth.passkey.addPasskey();
          return !result;
        },
        update: async (data) => {
          await auth.passkey.updatePasskey(data, { throw: true });
        },
        delete: async (id) => {
          await auth.passkey.deletePasskey({ id }, { throw: true });
        },
      },
      connections: {
        getAll: () => loadConnections(auth),
        add: (strategy) => linkAccount(auth, strategy),
        delete: (connection) => deleteConnection(auth, connection),
      },
    };
  }, [auth]);

  return {
    accountStore,
    actions,
  };
}
