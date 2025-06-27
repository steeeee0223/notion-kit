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

import { listSessions } from "@/lib/session";

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
  const auth = useAuth();
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
      preferredName: data.user.preferredName ?? data.user.name,
      email: data.user.email,
      avatarUrl: data.user.image ?? "",
      language: data.user.lang as AccountStore["language"],
      currentSessionId: data.session.id,
      sessions: [],
    });

    void listSessions().then((sessions) =>
      setAccountStore((prev) => ({ ...prev, sessions })),
    );
  }, [data]);

  const updateSettings = useCallback<UpdateSettings>(
    async (data) => {
      await auth.updateUser({
        name: data.account?.name,
        image: data.account?.avatarUrl,
        preferredName: data.account?.preferredName,
        lang: data.account?.language,
      });
    },
    [auth],
  );

  const signOut = useCallback(async () => {
    await auth.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
        onError: ({ error }) => {
          console.error("Sign out error", error);
          toast.error("Sign out error", { description: error.message });
        },
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
              onError: ({ error }) => {
                console.error("Delete account error", error);
                toast.error("Delete account error", {
                  description: error.message,
                });
              },
            },
          );
        },
        sendEmailVerification: async (email) => {
          await auth.sendVerificationEmail(
            { email },
            {
              onSuccess: () => void toast.success("Verification email sent"),
              onError: ({ error }) => {
                console.error("Send verification email error", error);
                toast.error("Send verification email error", {
                  description: error.message,
                });
              },
            },
          );
        },
        changePassword: async (data) => {
          await auth.changePassword(
            { ...data, revokeOtherSessions: true },
            {
              onSuccess: () =>
                void toast.success("Password changed successfully"),
              onError: ({ error }) => {
                console.error("Change password error", error);
                toast.error("Change password error", {
                  description: error.message,
                });
              },
            },
          );
        },
        logoutAll: async () => {
          await auth.revokeOtherSessions(undefined, {
            onSuccess: () =>
              void toast.success("All sessions logged out successfully"),
            onError: ({ error }) => {
              console.error("Revoke sessions error", error);
              toast.error("Revoke sessions error", {
                description: error.message,
              });
            },
          });
        },
        logoutSession: async (token) => {
          await auth.revokeSession(
            { token },
            {
              onSuccess: () =>
                void toast.success("Session logged out successfully"),
              onError: ({ error }) => {
                console.error("Revoke session error", error);
                toast.error("Revoke session error", {
                  description: error.message,
                });
              },
            },
          );
        },
        addPasskey: async () => {
          const result = await auth.passkey.addPasskey();
          if (!result) {
            void toast.success("Add passkey successed");
            return true;
          }
          console.error("Add passkey error", result.error);
          toast.error("Add passkey error", {
            description: result.error.message,
          });
          return false;
        },
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
