"use client";

import { useTranslation } from "@notion-kit/i18n";
import { SelectPreset as Select, useTheme } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();
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
