"use client";

import { CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Separator, Switch } from "@notion-kit/shadcn";

import { HintButton } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";

export function TeamspacesSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("teamspaces.teamspaces", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <HintButton
        icon={CircleHelp}
        label={trans.info.learn}
        href="https://www.notion.com/help/intro-to-teamspaces#modify-teamspace-settings"
      />
      <SettingsRule {...trans.default}>{/* tags input */}</SettingsRule>
      <Separator />
      <SettingsRule {...trans.limit}>
        <Switch size="sm" />
      </SettingsRule>
      <Separator />
      <SettingsRule {...trans.manage}>
        <Button variant="blue" size="sm">
          {trans.manage.button}
        </Button>
      </SettingsRule>
      {/* teamspace table */}
    </SettingsSection>
  );
}
