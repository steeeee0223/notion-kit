"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";

import { Badge } from "@notion-kit/shadcn";

import { Scope, type InvitationRow } from "../../../../lib";
import { SortingToggle, UserCell } from "../../common-cells";
import { InvitationActionCell, RoleCell } from "../cells";
import { statusLabels } from "../constants";

interface CreateInvitationColumnsOptions {
  scopes: Set<Scope>;
  onCancel?: (id: string) => void;
}

export function createInvitationColumns({
  scopes,
  onCancel,
}: CreateInvitationColumnsOptions): ColumnDef<InvitationRow>[] {
  return [
    {
      accessorKey: "email",
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
      cell: ({ row }) => row.original.email,
      filterFn: (row, _columnId, filterValue) =>
        row.original.email.toLowerCase().includes(filterValue as string),
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
      cell: ({ row }) => <RoleCell role={row.original.role} className="px-1" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <SortingToggle
            title="Status"
            isSorted={isSorted}
            toggle={() => column.toggleSorting(isSorted === "asc")}
          />
        );
      },
      cell: ({ row }) => (
        <div className="cursor-default">
          <Badge variant="orange">{statusLabels[row.original.status]}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "invitedBy",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <SortingToggle
            title="Invited by"
            isSorted={isSorted}
            toggle={() => column.toggleSorting(isSorted === "asc")}
          />
        );
      },
      cell: ({ row }) => <UserCell user={row.original.invitedBy} />,
      filterFn: (row, _columnId, filterValue) =>
        row.original.invitedBy.email
          .toLowerCase()
          .includes(filterValue as string),
    },
    ...(scopes.has(Scope.MemberUpdate)
      ? [
          {
            id: "actions",
            cell: ({ row }: { row: Row<InvitationRow> }) =>
              row.original.status === "pending" && (
                <div className="flex items-center justify-end">
                  <InvitationActionCell
                    onCancel={() => onCancel?.(row.original.id)}
                  />
                </div>
              ),
          },
        ]
      : []),
  ];
}
