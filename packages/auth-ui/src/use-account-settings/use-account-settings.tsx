"use client";

import { useCallback, useMemo } from "react";

import type {
  AccountStore,
  SettingsActions,
  UpdateSettings,
} from "@notion-kit/settings-panel";
import { toast } from "@notion-kit/shadcn";

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

  const accountStore = useMemo(() => {
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
    };
  }, [data]);

  const updateSettings = useCallback<UpdateSettings>(
    async (data) => {
      if (!data.account) return;
      await auth.updateUser(
        {
          name: data.account.name,
          image: data.account.avatarUrl,
          preferredName: data.account.preferredName,
          lang: data.account.language,
        },
        { onError: (e) => handleError(e, "Update user error") },
      );
    },
    [auth],
  );

  const actions = useMemo<SettingsActions>(() => {
    return {
      account: {
        delete: async () => {
          await auth.deleteUser(
            { callbackURL: "/" },
            {
              onSuccess: () => {
                toast.success("Account deleted successfully");
              },
              onError: (e) => handleError(e, "Delete account error"),
            },
          );
        },
        sendEmailVerification: async (email) => {
          await auth.sendVerificationEmail(
            { email },
            {
              onSuccess: () => void toast.success("Verification email sent"),
              onError: (e) => handleError(e, "Send verification email error"),
            },
          );
        },
        changePassword: async (data) => {
          await auth.changePassword(
            { ...data, revokeOtherSessions: true },
            {
              onSuccess: () =>
                void toast.success("Password changed successfully"),
              onError: (e) => handleError(e, "Change password error"),
            },
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
    updateSettings,
  };
}
