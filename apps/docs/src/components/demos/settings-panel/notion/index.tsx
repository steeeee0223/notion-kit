"use client";

import { useMemo, useState } from "react";

import {
  createMockAdapters,
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
  type TabType,
} from "@notion-kit/settings-panel";

import { mockAccount, mockConnections, mockWorkspace } from "./data";

export default function Demo() {
  const [tab, setTab] = useState<TabType>("preferences");

  const adapters = useMemo(
    () =>
      createMockAdapters({
        account: mockAccount,
        workspace: mockWorkspace,
        connections: mockConnections,
      }),
    [],
  );

  return (
    <SettingsProvider adapters={adapters}>
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
