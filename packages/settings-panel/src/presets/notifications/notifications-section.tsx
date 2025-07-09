"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";

export function NotificationsSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("notifications", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.notifications.mobile}>
        <Switch size="sm" />
      </SettingsRule>
    </SettingsSection>
  );
}
