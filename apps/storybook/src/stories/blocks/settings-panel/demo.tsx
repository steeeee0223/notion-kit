"use client";

import { useState } from "react";

import { Role } from "@notion-kit/schemas";
import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
  type Invitations,
  type Memberships,
  type TabType,
  type Teamspaces,
} from "@notion-kit/settings-panel";

import { delay } from "@/lib/utils";

import {
  mockConnections,
  mockGuests,
  mockInvitations,
  mockMembers,
  mockSessions,
  mockSettings,
  mockTeamMembers,
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
      people={{
        getAll: () =>
          Promise.resolve(
            [...mockMembers, ...mockGuests].reduce<Memberships>(
              (acc, member) => {
                acc[member.user.id] = {
                  id: member.user.id,
                  user: member.user,
                  role: "role" in member ? member.role : Role.GUEST,
                };
                return acc;
              },
              {},
            ),
          ),
      }}
      invitations={{
        getAll: () =>
          Promise.resolve(
            mockInvitations.reduce<Invitations>((acc, i) => {
              acc[i.id] = i;
              return acc;
            }, {}),
          ),
      }}
      teamspaces={{
        getAll: () =>
          Promise.resolve(
            mockTeamspaces.reduce<Teamspaces>((acc, teamspace, i) => {
              acc[teamspace.id] = {
                ...teamspace,
                ownedBy: teamspace.ownedBy.name,
                members: mockTeamMembers.slice(0, i < 2 ? -1 : 5),
              };
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
