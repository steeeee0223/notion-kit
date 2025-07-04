"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth, useSession } from "@notion-kit/auth-ui";
import { Plan, Role } from "@notion-kit/schemas";
import {
  SettingsActions,
  TabType,
  UpdateSettings,
} from "@notion-kit/settings-panel";
import type { AccountStore, SettingsStore } from "@notion-kit/settings-panel";
import { toast } from "@notion-kit/shadcn";

import { getPasskeys, listSessions } from "@/lib/api";
import {
  deleteConnection,
  handleError,
  linkAccount,
  loadConnections,
} from "@/lib/utils";

const mockWorkspace: SettingsStore["workspace"] = {
  id: "workspace-0",
  name: "John's Private",
  icon: { type: "lucide", src: "activity", color: "#CB912F" },
  role: Role.OWNER,
  plan: Plan.FREE,
  domain: "fake-domain",
  inviteLink: "#",
};

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

export function useSettings() {
  const { auth } = useAuth();
  const { data } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<TabType>("account");
  const [accountStore, setAccountStore] = useState(initialAccountStore);

  useEffect(() => {
    if (!data) return;
    setAccountStore({
      hasPassword: true,
      id: data.user.id,
      name: data.user.name,
      preferredName: data.user.preferredName || data.user.name,
      email: data.user.email,
      avatarUrl: data.user.image ?? "",
      language: data.user.lang as AccountStore["language"],
      currentSessionId: data.session.id,
      sessions: [],
    });

    void listSessions().then((sessions) =>
      setAccountStore((prev) => ({ ...prev, sessions })),
    );
    void getPasskeys().then((passkeys) =>
      setAccountStore((prev) => ({ ...prev, passkeys })),
    );
  }, [data]);

  const updateSettings = useCallback<UpdateSettings>(
    async (data) => {
      if (!data.account) return;
      const res = await auth.updateUser({
        name: data.account.name,
        image: data.account.avatarUrl,
        preferredName: data.account.preferredName,
        lang: data.account.language,
      });
      if (res.error) {
        return handleError(res, "Update user error");
      }
      setAccountStore((prev) => ({ ...prev, ...data.account }));
    },
    [auth],
  );

  const signOut = useCallback(async () => {
    await auth.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
        onError: (e) => handleError(e, "Sign out error"),
      },
    });
  }, [auth, router]);

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
            onSuccess: () =>
              void toast.success("All sessions logged out successfully"),
            onError: (e) => handleError(e, "Revoke sessions error"),
          });
        },
        logoutSession: async (token) => {
          await auth.revokeSession(
            { token },
            {
              onSuccess: () =>
                void toast.success("Session logged out successfully"),
              onError: (e) => handleError(e, "Revoke session error"),
            },
          );
        },
        addPasskey: async () => {
          const result = await auth.passkey.addPasskey();
          if (!result) {
            toast.success("Add passkey successed");
            await getPasskeys().then((passkeys) =>
              setAccountStore((prev) => ({ ...prev, passkeys })),
            );
            return true;
          }
          handleError(result, "Add passkey error");
          return false;
        },
        updatePasskey: async (data) => {
          await auth.passkey.updatePasskey(data, {
            onSuccess: () => {
              toast.success("Passkey updated successfully");
              setAccountStore((prev) => ({
                ...prev,
                passkeys: prev.passkeys?.map((passkey) =>
                  passkey.id === data.id
                    ? { ...passkey, name: data.name }
                    : passkey,
                ),
              }));
            },
            onError: (e) => handleError(e, "Update passkey error"),
          });
        },
        deletePasskey: async (id) => {
          await auth.passkey.deletePasskey(
            { id },
            {
              onSuccess: () => {
                toast.success("Passkey deleted successfully");
                setAccountStore((prev) => ({
                  ...prev,
                  passkeys: prev.passkeys?.filter(
                    (passkey) => passkey.id !== id,
                  ),
                }));
              },
              onError: (e) => handleError(e, "Delete passkey error"),
            },
          );
        },
      },
      connections: {
        load: () => loadConnections(auth),
        add: (strategy) => linkAccount(auth, strategy, "/protected"),
        delete: (connection) => deleteConnection(auth, connection),
      },
    };
  }, [auth]);

  const settings = useMemo<SettingsStore>(() => {
    return {
      workspace: mockWorkspace,
      account: accountStore,
      memberships: {},
    };
  }, [accountStore]);

  return {
    tab,
    setTab,
    settings,
    updateSettings,
    actions,
    signOut,
  };
}
