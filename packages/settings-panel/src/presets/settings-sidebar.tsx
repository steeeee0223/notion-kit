"use client";

import React from "react";

import { useTranslation } from "@notion-kit/i18n";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
} from "@notion-kit/shadcn";

import {
  SettingsSidebarGroup,
  SettingsSidebarTitle,
  SettingsTab,
  useSettings,
} from "../core";
import { Scope } from "../lib";
import {
  workspaceTabs as _workspaceTabs,
  accountTabs,
  miscTabs,
  plansTabs,
  type TabType,
} from "./data";

interface SettingsSidebarPresetProps {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const SettingsSidebarPreset: React.FC<SettingsSidebarPresetProps> = ({
  tab,
  onTabChange,
}) => {
  const {
    settings: { account },
    scopes,
  } = useSettings();
  const { t } = useTranslation("settings");
  const workspaceTabs = _workspaceTabs.filter(
    (tab) => tab.value !== "people" || scopes.has(Scope.MemberRead),
  );

  return (
    <>
      <SettingsSidebarGroup>
        <SettingsSidebarTitle>{t("common.account")}</SettingsSidebarTitle>
        <SettingsTab
          name={account.preferredName}
          className="font-medium"
          isActive={tab === "account"}
          Icon={
            <Avatar className="size-5 border">
              <AvatarImage src={account.avatarUrl} alt="" />
              <AvatarFallback className="bg-default/5">
                {account.preferredName[0]}
              </AvatarFallback>
            </Avatar>
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
      </SettingsSidebarGroup>
      <Separator />
      <SettingsSidebarGroup>
        {miscTabs.map(({ value, Icon }) => (
          <SettingsTab
            key={value}
            name={t(`${value}.title`)}
            isActive={tab === value}
            Icon={Icon}
            onClick={() => onTabChange(value)}
          />
        ))}
      </SettingsSidebarGroup>
      <Separator />
      <SettingsSidebarGroup>
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
};
