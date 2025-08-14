"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Switch } from "@notion-kit/shadcn";

import { Content, TextLinks } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";

export function AnalyticsSection() {
  const {
    settings: { workspace },
  } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.analytics", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <Content
        hint={trans.analytics.hint}
        href="https://www.notion.com/help/workspace-analytics"
      >
        <SettingsRule
          title={trans.analytics.title}
          description={
            <TextLinks
              i18nKey="general.analytics.analytics.description"
              values={{ workspace: workspace.name }}
            />
          }
        >
          <Switch size="sm" />
        </SettingsRule>
      </Content>
    </SettingsSection>
  );
}
