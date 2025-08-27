"use client";

import { CircleHelp } from "lucide-react";

import { type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { Button, Input } from "@notion-kit/shadcn";

import {
  HintButton,
  permissions,
  TeamspacePermission,
} from "../../_components";
import type {
  TeamspacePermission as Permission,
  Scope,
  TeamMemberRow,
  TeamspaceRole,
} from "../../../lib";
import { TeamMembersTable } from "../../tables";
import { Card, Title } from "./common";

interface MembersContentProps {
  scopes: Set<Scope>;
  workspace: string;
  teamspace: {
    name: string;
    icon: IconData;
    description?: string;
    permission: Permission;
  };
  teamMembers: TeamMemberRow[];
  onUpdateMember?: (data: {
    memberId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemoveMember?: (memberId: string) => void | Promise<void>;
}

export function MembersContent({
  scopes,
  workspace,
  teamspace,
  teamMembers,
  onUpdateMember,
  onRemoveMember,
}: MembersContentProps) {
  const options = { ...permissions };
  options.default.description = permissions.default.getDescription(workspace);

  return (
    <div className="h-full space-y-5 overflow-auto">
      <section>
        <Title title="Permissions" />
        <Card className="mb-2.5 flex flex-col">
          <TeamspacePermission
            className="mx-0 h-11 px-0 hover:bg-transparent"
            {...options[teamspace.permission]}
          />
        </Card>
        <HintButton
          icon={CircleHelp}
          label="Learn about teamspace permissions"
          href="https://www.notion.com/help/intro-to-teamspaces#modify-teamspace-settings"
        />
      </section>
      <section>
        <Title title="Members" />
        <div className="flex flex-col gap-1.5">
          <div className="sticky top-0 z-10 flex items-center gap-1 bg-modal pb-2">
            <Button variant="blue" size="sm">
              Add members
            </Button>
            <Button variant="soft-blue" size="sm" disabled>
              <Icon.Link className="size-3 fill-current" />
              Copy link
            </Button>
            <Input
              className="mr-1 ml-auto w-[45%] rounded-full pl-3"
              search
              placeholder="Search for members or groups"
            />
          </div>
          <TeamMembersTable
            scopes={scopes}
            data={teamMembers}
            onUpdate={onUpdateMember}
            onRemove={onRemoveMember}
          />
        </div>
      </section>
    </div>
  );
}
