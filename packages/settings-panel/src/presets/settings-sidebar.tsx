"use client";

import { useTranslation } from "@notion-kit/i18n";

import {
  SettingsSidebarGroup,
  SettingsSidebarTitle,
  SettingsTab,
  useSettings,
} from "@/core";
import { Scope } from "@/lib";
import { Avatar } from "@/presets/_components";
import {
  accountTabs,
  adminTabs,
  billingTabs,
  featuresTabs,
  integrationsTabs,
  workspaceTabs,
  type TabType,
} from "@/presets/data";
import { useAccount } from "@/presets/hooks";

function createTabGroups(scopes: Set<Scope>) {
  const filteredWorkspaceTabs = workspaceTabs.filter((item) => {
    switch (item.value) {
      case "people":
        return scopes.has(Scope.MemberRead);
      default:
        return true;
    }
  });
  const filteredAdminTabs = adminTabs.filter((item) => {
    switch (item.value) {
      case "teamspaces":
        return scopes.has(Scope.TeamspaceRead);
      default:
        return true;
    }
  });

  return [
    { i18nKey: "common.workspace" as const, tabs: filteredWorkspaceTabs },
    { i18nKey: "common.features" as const, tabs: featuresTabs },
    { i18nKey: "common.integrations" as const, tabs: integrationsTabs },
    { i18nKey: "common.admin" as const, tabs: filteredAdminTabs },
    { i18nKey: "common.access-and-billing" as const, tabs: billingTabs },
  ];
}

interface SettingsSidebarPresetProps {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function SettingsSidebarPreset({
  tab,
  onTabChange,
}: SettingsSidebarPresetProps) {
  const { scopes } = useSettings();
  const { data: account } = useAccount();
  /** i18n */
  const { t } = useTranslation("settings");

  const tabGroups = createTabGroups(scopes);

  return (
    <>
      <SettingsSidebarGroup>
        <SettingsSidebarTitle>{t("common.account")}</SettingsSidebarTitle>
        <SettingsTab
          name={account.preferredName}
          className="font-medium"
          isActive={tab === "account"}
          Icon={
            <Avatar src={account.avatarUrl} fallback={account.preferredName} />
          }
          onClick={() => onTabChange("account")}
        />
        {accountTabs.map(({ value, Icon }) => (
          <SettingsTab
            key={value}
            name={t(`${value}.title`)}
            isActive={tab === value}
            Icon={Icon}
            onClick={() => onTabChange(value)}
          />
        ))}
      </SettingsSidebarGroup>
      {tabGroups.map(({ i18nKey, tabs }) => (
        <SettingsSidebarGroup key={i18nKey}>
          <SettingsSidebarTitle>{t(i18nKey)}</SettingsSidebarTitle>
          {tabs.map(({ value, Icon }) => (
            <SettingsTab
              key={value}
              name={t(`${value}.title`)}
              isActive={tab === value}
              Icon={Icon}
              onClick={() => onTabChange(value)}
            />
          ))}
        </SettingsSidebarGroup>
      ))}
    </>
  );
}
