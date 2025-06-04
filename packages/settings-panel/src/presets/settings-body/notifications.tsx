"use client";

import { ArrowUpRight, CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { Button, SelectPreset as Select, Switch } from "@notion-kit/shadcn";

import { HintButton } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";

export const Notifications = () => {
  /** i18n */
  const { t } = useTranslation("settings");
  const {
    title,
    notifications,
    slack: slackTexts,
    email: emailTexts,
    buttons,
  } = t("notifications", { returnObjects: true });

  return (
    <div className="space-y-12">
      <SettingsSection title={title}>
        <SettingsRule {...notifications.mobile}>
          <Switch size="sm" />
        </SettingsRule>
      </SettingsSection>
      <SettingsSection title={slackTexts.title}>
        <SettingsRule {...slackTexts.slack}>
          <Select options={slackTexts.slack.options} value="off" />
        </SettingsRule>
      </SettingsSection>
      <SettingsSection title={emailTexts.title}>
        <SettingsRule {...emailTexts.activity}>
          <Switch size="sm" />
        </SettingsRule>
        <SettingsRule {...emailTexts.digests}>
          <Switch size="sm" />
        </SettingsRule>
        <SettingsRule {...emailTexts.announcements}>
          <Button size="sm">
            <ArrowUpRight className="mr-2 size-4" />
            {emailTexts.announcements.button}
          </Button>
        </SettingsRule>
      </SettingsSection>
      <HintButton
        icon={CircleHelp}
        label={buttons.more}
        href="https://www.notion.com/help/add-and-manage-connections-with-the-api"
      />
    </div>
  );
};
