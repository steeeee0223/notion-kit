import { useState } from "react";

import { User } from "@notion-kit/schemas";
import { useTranslation } from "@notion-kit/ui/i18n";
import { type IconData } from "@notion-kit/ui/icon-block";
import { Icon } from "@notion-kit/ui/icons";
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
} from "@notion-kit/ui/primitives";

import type {
  TeamspacePermission as Permission,
  TeamMemberRow,
  TeamspaceRole,
} from "@/lib/types";
import {
  HintButton,
  permissions,
  TeamspacePermission,
} from "@/presets/_components";
import { AddTeamMembers } from "@/presets/modals";
import { TeamMembersTable } from "@/presets/tables";

import { Card, Title } from "./common";

interface MembersContentProps {
  workspace: string;
  teamspace: {
    name: string;
    icon: IconData;
    description?: string;
    permission: Permission;
  };
  teamMembers: TeamMemberRow[];
  onAddMembers?: (data: {
    userIds: string[];
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onUpdateMember?: (data: {
    userId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemoveMember?: (userId: string) => void | Promise<void>;
  onFetchWorkspaceMembers?: () => User[] | Promise<User[]>;
}

export function MembersContent({
  workspace,
  teamspace,
  teamMembers,
  onAddMembers,
  onUpdateMember,
  onRemoveMember,
  onFetchWorkspaceMembers,
}: MembersContentProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.teamspace-detail.members",
  });
  const options = { ...permissions };
  options.default.description = permissions.default.getDescription(workspace);
  /** Search field */
  const [search, setSearch] = useState("");
  /** Add team members */
  const [openAddTeamMembers, setOpenAddTeamMembers] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<
    (User & { invited?: boolean })[]
  >([]);
  const handleAddTeamMembers = async (open: boolean) => {
    setOpenAddTeamMembers(open);
    if (!onFetchWorkspaceMembers) return;
    if (!open) {
      setWorkspaceMembers([]);
      return;
    }
    const members = await onFetchWorkspaceMembers();
    const teamMemberIds = new Set(teamMembers.map((member) => member.id));
    setWorkspaceMembers(
      members.map((member) => ({
        ...member,
        invited: teamMemberIds.has(member.id),
      })),
    );
  };

  return (
    <div className="h-full space-y-5 overflow-auto">
      <section>
        <Title title={t("permissions-title")} />
        <Card className="mb-2.5 flex flex-col">
          <TeamspacePermission
            className="mx-0 h-11 px-0 hover:bg-transparent"
            {...options[teamspace.permission]}
          />
        </Card>
        <HintButton
          icon="help"
          label={t("learn-more-permissions")}
          href="https://www.notion.com/help/intro-to-teamspaces#modify-teamspace-settings"
        />
      </section>
      <section>
        <Title title={t("members-title")} />
        <div className="flex flex-col gap-1.5">
          <div className="sticky top-0 z-10 flex items-center gap-1 bg-modal pb-2">
            <Dialog
              open={openAddTeamMembers}
              onOpenChange={handleAddTeamMembers}
            >
              <DialogTrigger asChild>
                <Button variant="blue" size="sm">
                  {t("add-members")}
                </Button>
              </DialogTrigger>
              <AddTeamMembers
                teamspace={teamspace}
                workspaceMembers={workspaceMembers}
                onAddMembers={async (data) => {
                  await onAddMembers?.(data);
                  setOpenAddTeamMembers(false);
                }}
              />
            </Dialog>
            <Button variant="soft-blue" size="sm" disabled>
              <Icon.Link className="size-3 fill-current" />
              {t("copy-link")}
            </Button>
            <Input
              className="mr-1 ml-auto w-[45%] rounded-full pl-3"
              search
              placeholder={t("search-placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <TeamMembersTable
            data={teamMembers}
            search={search}
            onUpdate={onUpdateMember}
            onRemove={onRemoveMember}
            onSearchChange={setSearch}
          />
        </div>
      </section>
    </div>
  );
}
