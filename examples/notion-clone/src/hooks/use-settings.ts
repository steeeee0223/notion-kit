"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  handleError,
  useAccountSettings,
  useAuth,
  useWorkspaceSettings,
} from "@notion-kit/auth-ui";
import type { TabType } from "@notion-kit/settings-panel";

export function useSettings() {
  const { auth } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<TabType>("account");
  const { accountStore, actions: accountActions } = useAccountSettings();
  const { workspaceStore, actions: workspaceActions } = useWorkspaceSettings();

  const actions = useMemo(
    () => ({
      ...accountActions,
      ...workspaceActions,
    }),
    [accountActions, workspaceActions],
  );

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
      workspace: workspaceStore,
      account: accountStore,
      memberships: {},
    },
    actions,
    signOut,
  };
}
