"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@notion-kit/shadcn";

import { Content } from "../_components";
import { SettingsSection } from "../../core";

export function ExportSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.export", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <Content
        {...trans.content}
        href="https://www.notion.com/help/workspace-settings"
      >
        <Button size="sm">{trans.content.button}</Button>
      </Content>
      <Content
        {...trans.members}
        plan="business"
        href="https://www.notion.com/help/workspace-settings"
      >
        <Button size="sm" disabled>
          {trans.members.button}
        </Button>
      </Content>
    </SettingsSection>
  );
}
