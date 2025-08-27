"use client";

import { useState } from "react";

import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
  Teamspaces,
  type TabType,
} from "@notion-kit/settings-panel";

import { delay } from "@/lib/utils";

import {
  mockConnections,
  mockSessions,
  mockSettings,
  mockTeamspaces,
} from "./data";

export const Demo = () => {
  const [tab, setTab] = useState<TabType>("preferences");
  const [settings, setSettings] = useState(mockSettings);
  return (
    <SettingsProvider
      settings={settings}
      account={{
        update: async (data) => {
          await delay(500);
          setSettings((prev) => ({
            ...prev,
            account: { ...prev.account, ...data },
          }));
        },
      }}
      workspace={{
        update: async (data) => {
          await delay(500);
          setSettings((prev) => ({
            ...prev,
            workspace: { ...prev.workspace, ...data },
          }));
        },
      }}
      sessions={{
        getAll: () => Promise.resolve(mockSessions),
      }}
      connections={{
        getAll: () => Promise.resolve(mockConnections),
      }}
      teamspaces={{
        getAll: () =>
          Promise.resolve(
            mockTeamspaces.reduce<Teamspaces>((acc, teamspace) => {
              acc[teamspace.id] = teamspace;
              return acc;
            }, {}),
          ),
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
