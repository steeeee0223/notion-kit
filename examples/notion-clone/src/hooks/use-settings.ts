"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import {
  handleError,
  useAuth,
  useSettingsAdapters,
  useSettingsStore,
} from "@notion-kit/auth-ui";
import type { TabType } from "@notion-kit/settings-panel";

export function useSettings() {
  const { auth } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<TabType>("account");
  const settings = useSettingsStore();
  const adapters = useSettingsAdapters();

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
    settings,
    adapters,
    signOut,
  };
}
