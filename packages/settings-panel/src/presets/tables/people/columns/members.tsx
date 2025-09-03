"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";

import { Role } from "@notion-kit/schemas";

import { MemberRow, PartialRole, Scope } from "../../../../lib";
import { SortingToggle, TextCell, UserCell } from "../../common-cells";
import { userFilterFn } from "../../utils";
import { MemberActionCell, RoleSelectCell, TeamspacesCell } from "../cells";

interface GetMemberColumnsOptions {
  scopes: Set<Scope>;
  userId?: string;
  onUpdate?: (data: { id: string; memberId: string; role: Role }) => void;
  onDelete?: (data: { id: string; memberId: string }) => void;
  onTeamspaceSelect?: (teamspaceId: string) => void;
}

export const getMemberColumns = ({
  scopes,
  userId,
  onUpdate,
  onDelete,
  onTeamspaceSelect,
}: GetMemberColumnsOptions): ColumnDef<MemberRow, MemberRow>[] => [
  {
    accessorKey: "user",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <SortingToggle
          title="User"
          isSorted={isSorted}
          toggle={() => column.toggleSorting(isSorted === "asc")}
        />
      );
    },
    cell: ({ row }) => <UserCell user={row.original.user} />,
    filterFn: userFilterFn,
  },
  {
    accessorKey: "teamspaces",
    header: () => (
      <TextCell header value="Teamspaces" className="min-w-[175px] pl-2" />
    ),
    cell: ({ row }) => (
      <TeamspacesCell
        teamspaces={row.original.teamspaces}
        onTeamspaceSelect={onTeamspaceSelect}
      />
    ),
  },
  {
    accessorKey: "groups",
    header: () => <TextCell header value="Groups" className="min-w-30" />,
    cell: () => (
      <div className="min-w-30 cursor-default text-sm text-muted">None</div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <SortingToggle
          title="Role"
          isSorted={isSorted}
          toggle={() => column.toggleSorting(isSorted === "asc")}
        />
      );
    },
    cell: ({ row }) => (
      <RoleSelectCell
        scopes={scopes}
        role={row.original.role as PartialRole}
        onSelect={(role) =>
          onUpdate?.({
            id: row.original.user.id,
            memberId: row.original.id,
            role,
          })
        }
      />
    ),
  },
  ...(scopes.has(Scope.MemberUpdate)
    ? [
        {
          id: "actions",
          cell: ({ row }: { row: Row<MemberRow> }) => {
            const id = row.original.user.id;
            return (
              <div className="flex min-w-[52px] items-center justify-end">
                <MemberActionCell
                  isSelf={id === userId}
                  onDelete={() => onDelete?.({ id, memberId: row.original.id })}
                />
              </div>
            );
          },
        },
      ]
    : []),
];
