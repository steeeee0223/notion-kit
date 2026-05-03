"use client";

import { useTranslation } from "@notion-kit/ui/i18n";
import { SelectPreset as Select } from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "../../core";

export function SlackSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("notifications.slack", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.slack}>
        <Select options={trans.slack.options} value="off" />
      </SettingsRule>
    </SettingsSection>
  );
}
