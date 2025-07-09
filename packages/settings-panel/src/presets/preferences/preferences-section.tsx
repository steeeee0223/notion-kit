"use client";

import { useTranslation } from "@notion-kit/i18n";
import { SelectPreset as Select } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../core";

export function PreferencesSection() {
  const { theme, setTheme } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("preferences", {
    returnObjects: true,
  });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.preferences.appearance}>
        <Select
          options={trans.preferences.appearance.options}
          value={theme ?? "system"}
          onChange={setTheme}
          side="left"
        />
      </SettingsRule>
    </SettingsSection>
  );
}
