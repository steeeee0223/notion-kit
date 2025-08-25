"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";

import { Role } from "@notion-kit/schemas";

import { MemberRow, PartialRole, Scope } from "../../../../lib";
import { SortingToggle, TextCell } from "../../common-cells";
import {
  MemberActionCell,
  RoleSelectCell,
  TeamspacesCell,
  UserCell,
} from "../cells";

interface GetMemberColumnsOptions {
  scopes: Set<Scope>;
  memberId?: string;
  onUpdate?: (id: string, role: Role) => void;
  onDelete?: (id: string) => void;
}

export const getMemberColumns = ({
  scopes,
  memberId,
  onUpdate,
  onDelete,
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
    filterFn: (row, _columnId, filterValue) =>
      row.original.user.email.toLowerCase().includes(filterValue as string),
  },
  {
    accessorKey: "teamspaces",
    header: () => (
      <TextCell header value="Teamspaces" className="min-w-[175px] pl-2" />
    ),
    cell: ({ row }) => <TeamspacesCell teamspaces={row.original.teamspaces} />,
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
        onSelect={(role) => onUpdate?.(row.original.user.id, role)}
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
                  isSelf={id === memberId}
                  onDelete={() => onDelete?.(id)}
                />
              </div>
            );
          },
        },
      ]
    : []),
];
