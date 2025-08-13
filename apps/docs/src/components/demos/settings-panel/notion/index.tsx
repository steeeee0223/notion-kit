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
      account={{
        update: (data) => {
          setSettings((prev) => ({
            ...prev,
            account: { ...prev.account, ...data },
          }));
          return Promise.resolve();
        },
      }}
      workspace={{
        update: (data) => {
          setSettings((prev) => ({
            ...prev,
            workspace: { ...prev.workspace, ...data },
          }));
          return Promise.resolve();
        },
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
