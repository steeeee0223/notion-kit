"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { handleError, useAccountSettings, useAuth } from "@notion-kit/auth-ui";
import { Plan, Role } from "@notion-kit/schemas";
import type { TabType, WorkspaceStore } from "@notion-kit/settings-panel";

const mockWorkspace: WorkspaceStore = {
  id: "workspace-0",
  name: "John's Private",
  icon: { type: "lucide", src: "activity", color: "#CB912F" },
  role: Role.OWNER,
  plan: Plan.FREE,
  slug: "fake-slug",
  inviteLink: "#",
};

export function useSettings() {
  const { auth } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<TabType>("account");
  const { accountStore, actions } = useAccountSettings();

  const signOut = useCallback(async () => {
    await auth.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
        onError: (e) => handleError(e, "Sign out error"),
      },
    });
  }, [auth, router]);

  return {
    tab,
    setTab,
    settings: {
      workspace: mockWorkspace,
      account: accountStore,
      memberships: {},
    },
    actions,
    signOut,
  };
}
