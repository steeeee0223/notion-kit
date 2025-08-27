"use client";

import { CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { Button, Separator, Switch } from "@notion-kit/shadcn";
import { TagsInput } from "@notion-kit/tags-input";

import { HintButton } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { CreateTeamspace } from "../modals";
import { TeamspacesTable } from "../tables";
import { useTeamspaceActions } from "./use-teamspace-actions";
import { useTeamspaces } from "./use-teamspaces";

export function TeamspacesSection() {
  const {
    scopes,
    settings: { workspace },
  } = useSettings();
  const { openModal } = useModal();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("teamspaces.teamspaces", { returnObjects: true });
  /** handlers */
  const { data: teamspaces } = useTeamspaces((res) => Object.values(res));
  const { create, update, remove, leave, updateMember, removeMember } =
    useTeamspaceActions();
  const openCreateTeamspace = () =>
    openModal(<CreateTeamspace workspace={workspace.name} onSubmit={create} />);
  // TODO update default teamspace
  // TODO limit creation to owner

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
      <TeamspacesTable
        scopes={scopes}
        workspace={workspace.name}
        data={teamspaces}
        onUpdate={update}
        onArchive={remove}
        onLeave={leave}
        onUpdateMember={updateMember}
        onRemoveMember={removeMember}
      />
    </SettingsSection>
  );
}
