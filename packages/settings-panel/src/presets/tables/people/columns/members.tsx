import type { ColumnDef, Row } from "@tanstack/react-table";

import { Role } from "@notion-kit/schemas";
import { Trans } from "@notion-kit/ui/i18n";

import { MemberRow, PartialRole, Scope } from "@/lib/types";
import {
  SortingToggle,
  TextCell,
  UserCell,
} from "@/presets/tables/common-cells";
import { userFilterFn } from "@/presets/tables/utils";

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
            title={<Trans i18nKey="tables.people.columns.user" />}
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
        <TextCell
          value={<Trans i18nKey="tables.people.columns.teamspaces" />}
          className="pl-2"
        />
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
      header: () => (
        <TextCell value={<Trans i18nKey="tables.people.columns.groups" />} />
      ),
      cell: () => (
        <div className="cursor-default text-sm text-muted">
          <Trans i18nKey="tables.people.cells.none" />
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <SortingToggle
            title={<Trans i18nKey="tables.people.columns.role" />}
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
