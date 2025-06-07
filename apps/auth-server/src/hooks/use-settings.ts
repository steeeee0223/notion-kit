import { useCallback, useEffect, useState } from "react";

import { TabType, UpdateSettings } from "@notion-kit/settings-panel";

import { useSession } from "@/lib/auth-client";
import { mockSettings } from "@/lib/data";

export function useSettings() {
  const { data } = useSession();

  const [tab, setTab] = useState<TabType>("preferences");
  const [settings, setSettings] = useState({ ...mockSettings });

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
      },
    }));
  }, [data]);

  const updateSettings = useCallback<UpdateSettings>(async (data) => {
    await Promise.resolve();
    setSettings((prev) => ({
      account: { ...prev.account, ...data.account },
      workspace: { ...prev.workspace, ...data.workspace },
      memberships: { ...prev.memberships, ...data.memberships },
    }));
  }, []);

  return {
    tab,
    setTab,
    settings,
    updateSettings,
  };
}
