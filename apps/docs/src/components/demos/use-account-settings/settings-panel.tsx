"use client";

import { useMemo, useState } from "react";

import { AuthProvider, useAccountSettings } from "@notion-kit/auth-ui";
import { Plan, Role } from "@notion-kit/schemas";
import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
  type SettingsStore,
  type TabType,
  type WorkspaceStore,
} from "@notion-kit/settings-panel";

export default function Demo() {
  return (
    <AuthProvider>
      <Settings />
    </AuthProvider>
  );
}

const mockWorkspace: WorkspaceStore = {
  id: "workspace-0",
  name: "John's Private",
  icon: { type: "lucide", src: "activity", color: "#CB912F" },
  role: Role.OWNER,
  plan: Plan.FREE,
  domain: "fake-domain",
  inviteLink: "#",
};

function Settings() {
  const [tab, setTab] = useState<TabType>("account");
  const { accountStore, actions, updateSettings } = useAccountSettings();
  const settings = useMemo<SettingsStore>(
    () => ({
      account: accountStore,
      workspace: mockWorkspace,
      memberships: {},
    }),
    [accountStore],
  );

  return (
    <SettingsProvider
      settings={settings}
      updateSettings={updateSettings}
      {...actions}
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
}
