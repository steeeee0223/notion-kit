"use client";

import { memo, useMemo } from "react";

import type { IconData } from "@notion-kit/icon-block";
import { ModalProvider, useModal } from "@notion-kit/modal";
import { TooltipProvider } from "@notion-kit/shadcn";

import type {
  Scope,
  TeamMemberRow,
  TeamspacePermission,
  TeamspaceRole,
  TeamspaceRow,
} from "../../../lib";
import { TeamspaceDetail } from "../../modals";
import { createTeamMembersColumns, createTeamspaceColumns } from "./columns";
import { DataTable } from "./data-table";

interface TeamspacesTableProps {
  className?: string;
  data: TeamspaceRow[];
  workspace: string;
  scopes: Set<Scope>;
  onUpdate?: (data: {
    id: string;
    name?: string;
    icon?: IconData;
    description?: string;
    permission?: TeamspacePermission;
  }) => Promise<void>;
  onArchive?: (teamspaceId: string) => void | Promise<void>;
  onLeave?: (teamspaceId: string) => void | Promise<void>;
  onUpdateMember?: (data: {
    teamspaceId: string;
    memberId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemoveMember?: (data: {
    teamspaceId: string;
    memberId: string;
  }) => void | Promise<void>;
}

export const TeamspacesTable = memo<TeamspacesTableProps>((props) => {
  return (
    <ModalProvider>
      <TooltipProvider delayDuration={200}>
        <Table {...props} />
      </TooltipProvider>
    </ModalProvider>
  );
});

function Table({
  className,
  data,
  workspace,
  scopes,
  onUpdate,
  onArchive,
  onLeave,
  onUpdateMember,
  onRemoveMember,
}: TeamspacesTableProps) {
  const { openModal } = useModal();
  const columns = useMemo(
    () =>
      createTeamspaceColumns({
        workspace,
        scopes,
        onUpdate,
        onArchive,
        onLeave,
      }),
    [workspace, scopes, onLeave, onArchive, onUpdate],
  );

  return (
    <DataTable
      className={className}
      columns={columns}
      data={data}
      onRowClick={(row) => {
        const teamspaceId = row.original.id;
        openModal(
          <TeamspaceDetail
            scopes={scopes}
            workspace={workspace}
            teamspace={{
              name: row.original.name,
              description: row.original.description,
              icon: row.original.icon,
              permission: row.original.permission,
            }}
            teamMembers={row.original.members}
            onLeave={() => onLeave?.(teamspaceId)}
            onUpdateMember={(data) =>
              onUpdateMember?.({ teamspaceId, ...data })
            }
            onRemoveMember={(memberId) =>
              onRemoveMember?.({ teamspaceId, memberId })
            }
          />,
        );
      }}
    />
  );
}

interface TeamMembersTableProps {
  scopes: Set<Scope>;
  data: TeamMemberRow[];
  onUpdate?: (data: {
    memberId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemove?: (memberId: string) => void | Promise<void>;
}

export const TeamMembersTable = memo(
  ({ scopes, data, onUpdate, onRemove }: TeamMembersTableProps) => {
    const columns = useMemo(
      () => createTeamMembersColumns({ scopes, onUpdate, onRemove }),
      [onUpdate, onRemove, scopes],
    );
    return <DataTable columns={columns} data={data} />;
  },
);
