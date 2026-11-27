"use client";

import { useState } from "react";

import { useSettingsAdapters } from "@notion-kit/auth-ui";
import type { TabType } from "@notion-kit/settings-panel";

export function useSettings() {
  const [tab, setTab] = useState<TabType>("account");
  const adapters = useSettingsAdapters();

  return {
    tab,
    setTab,
    adapters,
  };
}
