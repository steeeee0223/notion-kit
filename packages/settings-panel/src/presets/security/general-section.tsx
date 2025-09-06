"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";

export function GeneralSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("security.general", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.publish} plan="enterprise">
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.duplicate} plan="enterprise">
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.export} plan="enterprise">
        <Switch size="sm" disabled />
      </SettingsRule>
    </SettingsSection>
  );
}
