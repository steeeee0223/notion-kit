"use client";

import { CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { Switch } from "@notion-kit/shadcn";

import { HintButton, TextLinks } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";
import { useWorkspace } from "../hooks";

export function AnalyticsSection() {
  const { data: workspace } = useWorkspace();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.analytics", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
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
      <HintButton
        icon={CircleHelp}
        label={trans.analytics.hint}
        href="https://www.notion.com/help/workspace-analytics"
      />
    </SettingsSection>
  );
}
