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

import { mockConnections, mockSettings } from "./data";

export default function Demo() {
  const [tab, setTab] = useState<TabType>("preferences");
  const [settings, setSettings] = useState(mockSettings);
  return (
    <SettingsProvider
      settings={settings}
      updateSettings={(data) => {
        setSettings((prev) => ({
          account: { ...prev.account, ...data.account },
          workspace: { ...prev.workspace, ...data.workspace },
          memberships: { ...prev.memberships, ...data.memberships },
        }));
        return Promise.resolve();
      }}
      connections={{
        getAll: () => Promise.resolve(mockConnections),
      }}
    >
      <SettingsPanel className="w-[calc(100%-20px)]">
        <SettingsSidebar>
          <SettingsSidebarPreset tab={tab} onTabChange={setTab} />
        </SettingsSidebar>
        <SettingsContent>
          <SettingsBodyPreset tab={tab} onTabChange={setTab} />
        </SettingsContent>
      </SettingsPanel>
    </SettingsProvider>
  );
}
