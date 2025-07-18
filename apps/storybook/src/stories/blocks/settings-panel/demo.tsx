"use client";

import { useState } from "react";

import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
  type TabType,
} from "@notion-kit/settings-panel";

import { delay } from "@/lib/utils";

import { mockConnections, mockSessions, mockSettings } from "./data";

export const Demo = () => {
  const [tab, setTab] = useState<TabType>("preferences");
  const [settings, setSettings] = useState(mockSettings);
  return (
    <SettingsProvider
      settings={settings}
      updateSettings={async (data) => {
        await delay(500);
        setSettings((prev) => ({
          account: { ...prev.account, ...data.account },
          workspace: { ...prev.workspace, ...data.workspace },
          memberships: { ...prev.memberships, ...data.memberships },
        }));
      }}
      sessions={{
        getAll: () => Promise.resolve(mockSessions),
      }}
      connections={{
        getAll: () => Promise.resolve(mockConnections),
      }}
    >
      <SettingsPanel>
        <SettingsSidebar>
          <SettingsSidebarPreset tab={tab} onTabChange={setTab} />
        </SettingsSidebar>
        <SettingsContent>
          <SettingsBodyPreset tab={tab} onTabChange={setTab} />
        </SettingsContent>
      </SettingsPanel>
    </SettingsProvider>
  );
};
