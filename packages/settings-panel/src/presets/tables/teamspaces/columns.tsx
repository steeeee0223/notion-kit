import type { ColumnDef } from "@tanstack/react-table";

import type { IconData } from "@notion-kit/icon-block";
import { toDateString } from "@notion-kit/utils";

import type {
  TeamMemberRow,
  TeamspacePermission,
  TeamspaceRole,
  TeamspaceRow,
} from "../../../lib";
import { SortingToggle, TextCell, UserCell } from "../common-cells";
import { userFilterFn } from "../utils";
import {
  AccessSelectCell,
  OwnersCell,
  TeamMemberActionCell,
  TeamspaceActionCell,
  TeamspaceCell,
} from "./cells";

interface CreateTeamspaceColumnsOptions {
  workspace: string;
  onViewDetail?: (teamspace: TeamspaceRow) => void | Promise<void>;
  onLeave?: (teamspace: TeamspaceRow) => void | Promise<void>;
  onUpdate?: (data: {
    id: string;
    name?: string;
    icon?: IconData;
    description?: string;
    permission?: TeamspacePermission;
  }) => void | Promise<void>;
  onArchive?: (teamspace: TeamspaceRow) => void | Promise<void>;
}

export function createTeamspaceColumns({
  workspace,
  onViewDetail,
  onLeave,
  onUpdate,
  onArchive,
}: CreateTeamspaceColumnsOptions): ColumnDef<TeamspaceRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-[35%] items-center">
            <SortingToggle
              title="Teamspace"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <TeamspaceCell
          name={row.original.name}
          icon={row.original.icon}
          memberCount={row.original.memberCount}
        />
      ),
    },
    {
      accessorKey: "ownedBy",
      header: () => (
        <div className="flex w-1/4 min-w-20 items-center px-2">
          <TextCell header value="Owners" />
        </div>
      ),
      cell: ({ row }) => (
        <OwnersCell
          ownedBy={row.original.ownedBy}
          count={row.original.ownerCount}
        />
      ),
    },
    {
      accessorKey: "permission",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-[90px] items-center px-2">
            <SortingToggle
              title="Access"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <AccessSelectCell
          workspace={workspace}
          permission={row.original.permission}
          disabled={row.original.role !== "owner"}
          onSelect={(permission) =>
            onUpdate?.({ id: row.original.id, permission })
          }
        />
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-[15%] items-center">
            <SortingToggle
              title="Updated"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => {
        const updatedAt = toDateString(row.original.updatedAt);
        return <TextCell className="text-sm text-primary" value={updatedAt} />;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex min-w-[52px] items-center justify-end pr-3">
          <TeamspaceActionCell
            name={row.original.name}
            role={row.original.role}
            onViewDetail={() => onViewDetail?.(row.original)}
            onArchive={() => onArchive?.(row.original)}
            onLeave={() => onLeave?.(row.original)}
          />
        </div>
      ),
    },
  ];
}

interface CreateTeamMembersColumnsOptions {
  onUpdate?: (data: {
    userId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemove?: (userId: string) => void | Promise<void>;
}

export function createTeamMembersColumns({
  onUpdate,
  onRemove,
}: CreateTeamMembersColumnsOptions): ColumnDef<TeamMemberRow>[] {
  return [
    {
      accessorKey: "user",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-3/4 items-center">
            <SortingToggle
              title="User"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => <UserCell user={row.original.user} />,
      filterFn: userFilterFn,
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-1/4 items-center">
            <SortingToggle
              title="Role"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <TeamMemberActionCell
          role={row.original.role}
          onUpdate={(role) => onUpdate?.({ userId: row.original.id, role })}
          onRemove={() => onRemove?.(row.original.id)}
        />
      ),
    },
  ];
}
