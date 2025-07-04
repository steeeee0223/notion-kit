"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AccountStore,
  SessionRow,
  SettingsActions,
  UpdateSettings,
} from "@notion-kit/settings-panel";
import { toast } from "@notion-kit/shadcn";

import { useAuth, usePasskeys, useSession } from "../auth-provider";
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
  sessions: [],
};

export function useAccountSettings() {
  const { auth } = useAuth();
  const { data } = useSession();
  const { data: passkeys } = usePasskeys();

  const [refetchSessions, setRefetchSessions] = useState(true);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  useEffect(() => {
    void auth
      .listSessions()
      .then((sessions) => {
        if (sessions.error) {
          handleError(sessions, "Fetch sessions error");
          return;
        }
        setSessions(transferSessions(sessions.data));
      })
      .finally(() => setRefetchSessions(false));
  }, [auth, refetchSessions]);

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
      sessions,
      passkeys: transferPasskeys(passkeys),
    };
  }, [data, passkeys, sessions]);

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
        logoutAll: async () => {
          await auth.revokeOtherSessions(undefined, {
            onSuccess: () => {
              toast.success("All sessions logged out successfully");
              setRefetchSessions(true);
            },
            onError: (e) => handleError(e, "Revoke sessions error"),
          });
        },
        logoutSession: async (token) => {
          await auth.revokeSession(
            { token },
            {
              onSuccess: () => {
                toast.success("Session logged out successfully");
                setRefetchSessions(true);
              },
              onError: (e) => handleError(e, "Revoke session error"),
            },
          );
        },
        addPasskey: async () => {
          const result = await auth.passkey.addPasskey();
          if (!result) {
            toast.success("Add passkey successed");
            return true;
          }
          handleError(result, "Add passkey error");
          return false;
        },
        updatePasskey: async (data) => {
          await auth.passkey.updatePasskey(data, {
            onSuccess: () => void toast.success("Passkey updated successfully"),
            onError: (e) => handleError(e, "Update passkey error"),
          });
        },
        deletePasskey: async (id) => {
          await auth.passkey.deletePasskey(
            { id },
            {
              onSuccess: () =>
                void toast.success("Passkey deleted successfully"),
              onError: (e) => handleError(e, "Delete passkey error"),
            },
          );
        },
      },
      connections: {
        load: () => loadConnections(auth),
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
