"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";

import { Role } from "@notion-kit/schemas";

import { MemberRow, PartialRole, Scope } from "../../../../lib";
import { SortingToggle, TextCell, UserCell } from "../../common-cells";
import { userFilterFn } from "../../utils";
import { MemberActionCell, RoleSelectCell, TeamspacesCell } from "../cells";

interface CreateMemberColumnsOptions {
  scopes: Set<Scope>;
  userId?: string;
  onUpdate?: (data: { id: string; memberId: string; role: Role }) => void;
  onDelete?: (data: MemberRow) => void;
  onTeamspaceSelect?: (teamspaceId: string) => void;
}

export function createMemberColumns({
  scopes,
  userId,
  onUpdate,
  onDelete,
  onTeamspaceSelect,
}: CreateMemberColumnsOptions): ColumnDef<MemberRow>[] {
  return [
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
      header: () => <TextCell value="Teamspaces" className="pl-2" />,
      cell: ({ row }) => (
        <TeamspacesCell
          teamspaces={row.original.teamspaces}
          onTeamspaceSelect={onTeamspaceSelect}
        />
      ),
    },
    {
      accessorKey: "groups",
      header: () => <TextCell value="Groups" />,
      cell: () => <div className="cursor-default text-sm text-muted">None</div>,
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
                <div className="flex items-center justify-end">
                  <MemberActionCell
                    isSelf={id === userId}
                    onDelete={() => onDelete?.(row.original)}
                  />
                </div>
              );
            },
          },
        ]
      : []),
  ];
}
