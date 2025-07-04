"use client";

import { ArrowUpRight } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";

export function EmailSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("notifications.email", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.activity}>
        <Switch size="sm" />
      </SettingsRule>
      <SettingsRule {...trans.digests}>
        <Switch size="sm" />
      </SettingsRule>
      <SettingsRule {...trans.announcements}>
        <Button size="sm">
          <ArrowUpRight className="mr-2 size-4" />
          {trans.announcements.button}
        </Button>
      </SettingsRule>
    </SettingsSection>
  );
}
