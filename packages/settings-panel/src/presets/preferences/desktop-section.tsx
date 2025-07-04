"use client";

import { useTranslation } from "@notion-kit/i18n";
import { SelectPreset as Select, Switch } from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";

export function DesktopSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("preferences.desktop", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans["open-on-start"]}>
        <Select
          options={trans["open-on-start"].options}
          value="top"
          side="left"
        />
      </SettingsRule>
      <SettingsRule
        title={trans["open-links"].title}
        description={
          <TextLinks
            i18nKey="preferences.desktop.open-links.description"
            hrefs="https://www.notion.so/desktop"
          />
        }
      >
        <Switch size="sm" />
      </SettingsRule>
    </SettingsSection>
  );
}
