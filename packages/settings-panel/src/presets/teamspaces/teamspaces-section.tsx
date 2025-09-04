"use client";

import { useState } from "react";
import { CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import {
  Button,
  Dialog,
  DialogTrigger,
  Separator,
  Switch,
} from "@notion-kit/shadcn";

import { HintButton } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { Scope } from "../../lib";
import { useTeamspaceActions, useTeamspaceDetail } from "../hooks";
import { CreateTeamspace } from "../modals";
import { TeamspacesTable } from "../tables";
import { DefaultTeamspace } from "./default-teamspace";
import { useTeamspacesTable } from "./use-teamspaces";

export function TeamspacesSection() {
  const {
    scopes,
    settings: { workspace },
  } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("teamspaces.teamspaces", { returnObjects: true });
  /** handlers */
  const teamspaces = useTeamspacesTable();
  const [openCreate, setOpenCreate] = useState(false);
  const { selectedTeamspace, setSelectedTeamspace, renderTeamspaceDetail } =
    useTeamspaceDetail();
  const { create, update, remove, leave } = useTeamspaceActions();

  // TODO limit creation to owner

  return (
    <SettingsSection title={trans.title}>
      <HintButton
        icon={CircleHelp}
        label={trans.info.learn}
        href="https://www.notion.com/help/intro-to-teamspaces#modify-teamspace-settings"
      />
      <SettingsRule {...trans.default} />
      <DefaultTeamspace />
      <Separator />
      <SettingsRule {...trans.limit}>
        <Switch size="sm" />
      </SettingsRule>
      <Separator />
      <SettingsRule {...trans.manage}>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger>
            <Button
              variant="blue"
              size="sm"
              disabled={!scopes.has(Scope.TeamspaceCreate)}
            >
              {trans.manage.button}
            </Button>
          </DialogTrigger>
          <CreateTeamspace
            workspace={workspace.name}
            onClose={() => setOpenCreate(false)}
            onSubmit={create}
          />
        </Dialog>
      </SettingsRule>
      <Dialog
        open={!!selectedTeamspace}
        onOpenChange={(open) => {
          if (open) return;
          setSelectedTeamspace(null);
        }}
      >
        {renderTeamspaceDetail()}
      </Dialog>
      <TeamspacesTable
        workspace={workspace.name}
        data={teamspaces}
        onRowSelect={(t) => setSelectedTeamspace(t.id)}
        onUpdate={update}
        onArchive={(t) => remove(t.id)}
        onLeave={(t) => leave(t.id)}
      />
    </SettingsSection>
  );
}
