"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";

import { Role } from "@notion-kit/schemas";

import { Scope, type MemberRow } from "../../../../lib";
import {
  Header,
  MemberActionCell,
  RoleCell,
  SortingToggle,
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
    id: "user",
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
    cell: ({ row }) => <UserCell user={row.getValue("user")} />,
    filterFn: (row, _columnId, filterValue) =>
      row
        .getValue<MemberRow["user"]>("user")
        .email.trim()
        .toLowerCase()
        .includes(filterValue as string),
  },
  {
    accessorKey: "teamspaces",
    header: () => (
      <Header title="Teamspaces" className="min-w-[175px] pl-2 text-sm" />
    ),
    cell: ({ row }) => (
      <TeamspacesCell teamspaces={row.getValue("teamspaces")} />
    ),
  },
  {
    accessorKey: "groups",
    header: () => <Header title="Groups" className="min-w-[120px] text-sm" />,
    cell: () => (
      <div className="min-w-[120px] cursor-default text-sm text-muted">
        None
      </div>
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
      <RoleCell
        scopes={scopes}
        role={row.getValue("role")}
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
