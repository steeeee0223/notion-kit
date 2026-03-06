"use client";

import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import type { AccountStore, WorkspaceStore } from "@notion-kit/settings-panel";
import {
  createMockAccountAdapter,
  createMockWorkspaceAdapter,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsRule,
  SettingsSection,
  SettingsSidebar,
  SettingsSidebarGroup,
  SettingsSidebarTitle,
  SettingsTab,
} from "@notion-kit/settings-panel";
import { Button, Switch } from "@notion-kit/shadcn";

const mockAccount: AccountStore = {
  id: "user1",
  name: "John Wick",
  avatarUrl: "",
  email: "john-wick@example.com",
  preferredName: "Jonathan",
  language: "en",
};

const mockWorkspace: WorkspaceStore = {
  id: "workspace1",
  name: "Workspace",
  icon: { type: "text", src: "W" },
  slug: "workspace",
  inviteLink: "#",
  plan: "free" as WorkspaceStore["plan"],
  role: "owner" as WorkspaceStore["role"],
};

const settingsTabs = [
  { Icon: <Icon.UserX />, value: "account", name: "Account" },
  { Icon: <Icon.Bell />, value: "notifications", name: "Notifications" },
] as const;

export function SettingsPage() {
  const [tab, setTab] = useState("account");

  return (
    <SettingsProvider
      adapters={{
        account: createMockAccountAdapter(mockAccount),
        workspace: createMockWorkspaceAdapter(mockWorkspace),
      }}
    >
      <SettingsPanel className="w-[calc(100%-20px)]">
        <SettingsSidebar>
          <SettingsSidebarGroup>
            <SettingsSidebarTitle>Account</SettingsSidebarTitle>
            {settingsTabs.map(({ value, ...props }) => (
              <SettingsTab
                {...props}
                isActive={tab === value}
                onClick={() => setTab(value)}
              />
            ))}
          </SettingsSidebarGroup>
        </SettingsSidebar>
        <SettingsContent>
          {tab === "account" ? (
            <SettingsSection title="Account">
              <SettingsRule
                title={mockAccount.preferredName}
                description={mockAccount.email}
              />
              <SettingsRule
                title="Set something"
                description="you can set something here"
              >
                <Switch size="sm" />
              </SettingsRule>
              <SettingsRule
                title="Set something 2"
                description="you can set another here"
              >
                <Button size="sm">Apply Settings</Button>
              </SettingsRule>
            </SettingsSection>
          ) : (
            <SettingsSection title="Notifications">
              <SettingsRule
                title="Turn on notifications"
                description="you can set something here"
              >
                <Switch size="sm" />
              </SettingsRule>
            </SettingsSection>
          )}
        </SettingsContent>
      </SettingsPanel>
    </SettingsProvider>
  );
}
