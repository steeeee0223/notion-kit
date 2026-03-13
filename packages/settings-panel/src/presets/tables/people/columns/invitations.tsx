import type { ColumnDef, Row } from "@tanstack/react-table";

import { Trans, useTranslation } from "@notion-kit/i18n";
import { Badge } from "@notion-kit/shadcn";

import { Scope, type InvitationRow } from "@/lib/types";
import { SortingToggle, UserCell } from "@/presets/tables/common-cells";

import { InvitationActionCell, RoleCell } from "../cells";

interface CreateInvitationColumnsOptions {
  scopes: Set<Scope>;
  onCancel?: (id: string) => void;
}

function StatusCell({ status }: { status: InvitationRow["status"] }) {
  const { t } = useTranslation("settings", {
    keyPrefix: "tables.people.statuses",
  });
  return (
    <div className="cursor-default">
      <Badge variant="orange">{t(status)}</Badge>
    </div>
  );
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
            title={<Trans i18nKey="tables.people.columns.user" />}
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
            title={<Trans i18nKey="tables.people.columns.role" />}
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
            title={<Trans i18nKey="tables.people.columns.status" />}
            isSorted={isSorted}
            toggle={() => column.toggleSorting(isSorted === "asc")}
          />
        );
      },
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
    {
      accessorKey: "invitedBy",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <SortingToggle
            title={<Trans i18nKey="tables.people.columns.invited-by" />}
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
