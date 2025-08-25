"use client";

import { CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { Button, Separator, Switch } from "@notion-kit/shadcn";
import { TagsInput } from "@notion-kit/tags-input";

import { HintButton } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { CreateTeamspace } from "../modals";

export function TeamspacesSection() {
  const {
    settings: { workspace },
  } = useSettings();
  const { openModal } = useModal();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("teamspaces.teamspaces", { returnObjects: true });
  /** handlers */
  const openCreateTeamspace = () =>
    openModal(<CreateTeamspace workspace={workspace.name} />);
  // TODO update default teamspace
  // TODO limit creation to owner
  // TODO teamspace table

  return (
    <SettingsSection title={trans.title}>
      <HintButton
        icon={CircleHelp}
        label={trans.info.learn}
        href="https://www.notion.com/help/intro-to-teamspaces#modify-teamspace-settings"
      />
      <SettingsRule {...trans.default} />
      <div className="flex items-center gap-2.5">
        <TagsInput
          className="w-full"
          value={{ tags: ["Acme Lab"], input: "" }}
        />
        <Button variant="blue" size="sm">
          {trans.default.button}
        </Button>
      </div>
      <Separator />
      <SettingsRule {...trans.limit}>
        <Switch size="sm" />
      </SettingsRule>
      <Separator />
      <SettingsRule {...trans.manage}>
        <Button variant="blue" size="sm" onClick={openCreateTeamspace}>
          {trans.manage.button}
        </Button>
      </SettingsRule>
      {/* teamspace table */}
    </SettingsSection>
  );
}
