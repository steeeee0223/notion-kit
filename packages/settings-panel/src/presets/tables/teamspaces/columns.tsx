import type { ColumnDef } from "@tanstack/react-table";

import type { IconData } from "@notion-kit/icon-block";
import { toDateString } from "@notion-kit/utils";

import type {
  Scope,
  TeamMemberRow,
  TeamspacePermission,
  TeamspaceRole,
  TeamspaceRow,
} from "../../../lib";
import { SortingToggle, TextCell } from "../common-cells";
import { UserCell } from "../people/cells";
import {
  AccessSelectCell,
  OwnersCell,
  TeamMemberActionCell,
  TeamspaceActionCell,
  TeamspaceCell,
} from "./cells";

interface CreateTeamspaceColumnsOptions {
  scopes: Set<Scope>;
  workspace: string;
  onLeave?: (teamspaceId: string) => void | Promise<void>;
  onUpdate?: (data: {
    id: string;
    name?: string;
    icon?: IconData;
    description?: string;
    permission?: TeamspacePermission;
  }) => void | Promise<void>;
  onArchive?: (teamspaceId: string) => void | Promise<void>;
}

export function createTeamspaceColumns({
  workspace,
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
      accessorKey: "owners",
      header: () => (
        <div className="flex w-1/4 min-w-20 items-center px-2">
          <TextCell header value="Owners" />
        </div>
      ),
      cell: ({ row }) => <OwnersCell {...row.original.owners} />,
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
            onArchive={() => onArchive?.(row.original.id)}
            onLeave={() => onLeave?.(row.original.id)}
          />
        </div>
      ),
    },
  ];
}

interface CreateTeamMembersColumnsOptions {
  scopes: Set<Scope>;
  onUpdate?: (data: {
    memberId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemove?: (memberId: string) => void | Promise<void>;
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
      filterFn: (row, _columnId, filterValue) =>
        row.original.user.email.toLowerCase().includes(filterValue as string),
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
          onUpdate={(role) => onUpdate?.({ memberId: row.original.id, role })}
          onRemove={() => onRemove?.(row.original.id)}
        />
      ),
    },
  ];
}
