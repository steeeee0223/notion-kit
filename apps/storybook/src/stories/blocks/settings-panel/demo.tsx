"use client";

import { useMemo, useState } from "react";

import { Role } from "@notion-kit/schemas";
import {
  createMockAdapters,
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

import { env } from "@/env";

import {
  mockAccount,
  mockConnections,
  mockGuests,
  mockInvitations,
  mockMembers,
  mockPasskeys,
  mockSessions,
  mockTeamMembers,
  mockTeamspaces,
  mockWorkspace,
} from "./data";

interface DemoProps {
  tab: TabType;
}

function buildMemberships() {
  return [...mockMembers, ...mockGuests].reduce<Memberships>((acc, member) => {
    acc[member.user.id] = {
      id: member.user.id,
      user: member.user,
      role: "role" in member ? member.role : Role.GUEST,
    };
    return acc;
  }, {});
}

function buildInvitations() {
  return mockInvitations.reduce<Invitations>((acc, i) => {
    acc[i.id] = i;
    return acc;
  }, {});
}

function buildTeamspaces() {
  return mockTeamspaces.reduce<Teamspaces>((acc, teamspace, i) => {
    acc[teamspace.id] = {
      ...teamspace,
      ownedBy: teamspace.ownedBy.name,
      members: mockTeamMembers.slice(0, i < 2 ? -1 : 5),
    };
    return acc;
  }, {});
}

export function Demo({ tab: initialTab }: DemoProps) {
  const [tab, setTab] = useState(initialTab);

  const adapters = useMemo(
    () =>
      createMockAdapters({
        account: mockAccount,
        workspace: mockWorkspace,
        sessions: mockSessions,
        passkeys: mockPasskeys,
        connections: mockConnections,
        memberships: buildMemberships(),
        invitations: buildInvitations(),
        teamspaces: buildTeamspaces(),
        stripePublishableKey: env.STORYBOOK_STRIPE_PUBLISHABLE_KEY,
      }),
    [],
  );

  return (
    <SettingsProvider adapters={adapters}>
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
