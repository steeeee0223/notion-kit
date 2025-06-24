import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth, useSession } from "@notion-kit/auth-ui";
import { Plan, Role } from "@notion-kit/schemas";
import {
  SettingsActions,
  TabType,
  UpdateSettings,
} from "@notion-kit/settings-panel";
import type { SettingsStore } from "@notion-kit/settings-panel";
import { toast } from "@notion-kit/shadcn";

export const mockWorkspace: SettingsStore["workspace"] = {
  id: "workspace-0",
  name: "John's Private",
  icon: { type: "lucide", src: "activity", color: "#CB912F" },
  role: Role.OWNER,
  plan: Plan.FREE,
  domain: "fake-domain",
  inviteLink: "#",
};

export function useSettings() {
  const auth = useAuth();
  const { data } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<TabType>("account");
  const [settings, setSettings] = useState({
    account: {},
    workspace: mockWorkspace,
    memberships: {},
  } as SettingsStore);

  useEffect(() => {
    void auth.listSessions({
      fetchOptions: {
        onSuccess: (sessions) => {
          console.log("sessions", sessions);
        },
        onError: ({ error }) => {
          console.error("List sessions error", error);
          toast.error("List sessions error", { description: error.message });
        },
      },
    });
  }, [auth]);

  useEffect(() => {
    if (!data) return;
    setSettings((prev) => ({
      ...prev,
      account: {
        hasPassword: true,
        preferredName: data.user.name,
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatarUrl: data.user.image ?? "",
        language: "en",
        sessions: [],
      },
    }));
  }, [data]);

  const updateSettings = useCallback<UpdateSettings>(
    async (data) => {
      await auth.updateUser({
        name: data.account?.name,
        image: data.account?.avatarUrl,
      });
      setSettings((prev) => ({
        account: { ...prev.account, ...data.account },
        workspace: { ...prev.workspace, ...data.workspace },
        memberships: { ...prev.memberships, ...data.memberships },
      }));
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
          await auth.changePassword(data, {
            onSuccess: () =>
              void toast.success("Password changed successfully"),
            onError: ({ error }) => {
              console.error("Change password error", error);
              toast.error("Change password error", {
                description: error.message,
              });
            },
          });
        },
      },
    };
  }, [auth]);

  return {
    tab,
    setTab,
    settings,
    updateSettings,
    actions,
    signOut,
  };
}
