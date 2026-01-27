"use client";

import { useTranslation } from "@notion-kit/i18n";

import {
  SettingsSidebarGroup,
  SettingsSidebarTitle,
  SettingsTab,
  useSettings,
} from "../core";
import { Scope } from "../lib";
import { Avatar } from "./_components";
import {
  workspaceTabs as _workspaceTabs,
  accountTabs,
  miscTabs,
  plansTabs,
  type TabType,
} from "./data";
import { useAccount } from "./hooks";

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
  const { t } = useTranslation("settings");
  const workspaceTabs = _workspaceTabs.filter((tab) => {
    switch (tab.value) {
      case "people":
        return scopes.has(Scope.MemberRead);
      case "teamspaces":
        return scopes.has(Scope.TeamspaceRead);
      default:
        return true;
    }
  });

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
      <SettingsSidebarGroup>
        <SettingsSidebarTitle>{t("common.workspace")}</SettingsSidebarTitle>
        {workspaceTabs.map(({ value, Icon }) => (
          <SettingsTab
            key={value}
            name={t(`${value}.title`)}
            isActive={tab === value}
            Icon={Icon}
            onClick={() => onTabChange(value)}
          />
        ))}
        {miscTabs.map(({ value, Icon }) => (
          <SettingsTab
            key={value}
            name={t(`${value}.title`)}
            isActive={tab === value}
            Icon={Icon}
            onClick={() => onTabChange(value)}
          />
        ))}
        {plansTabs.map(({ value, Icon }) => (
          <SettingsTab
            key={value}
            name={t(`${value}.title`)}
            isActive={tab === value}
            Icon={Icon}
            onClick={() => onTabChange(value)}
          />
        ))}
      </SettingsSidebarGroup>
    </>
  );
}
