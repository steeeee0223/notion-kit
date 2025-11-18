"use client";

import { Trans, useTranslation } from "@notion-kit/i18n";
import { Button } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";
import { useWorkspace } from "../hooks";

export function ExportSection() {
  const { data: workspace } = useWorkspace();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.export", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans.content.title}
        description={
          <Trans
            i18nKey="general.export.content.description"
            values={{ workspace: workspace.name }}
          />
        }
        href="https://www.notion.com/help/workspace-settings"
      >
        <Button size="sm">{trans.content.button}</Button>
      </SettingsRule>
      <SettingsRule
        title={trans.members.title}
        description={
          <Trans
            i18nKey="general.export.members.description"
            values={{ workspace: workspace.name }}
          />
        }
        href="https://www.notion.com/help/workspace-settings"
      >
        <Button disabled size="sm">
          {trans.members.button}
        </Button>
      </SettingsRule>
    </SettingsSection>
  );
}
