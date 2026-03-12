import type { ColumnDef, Row } from "@tanstack/react-table";

import { Trans } from "@notion-kit/i18n";
import { Role } from "@notion-kit/schemas";
import { Checkbox } from "@notion-kit/shadcn";

import { Scope, type GuestRow } from "@/lib/types";
import {
  SortingToggle,
  TextCell,
  UserCell,
} from "@/presets/tables/common-cells";
import { userFilterFn } from "@/presets/tables/utils";

import { AccessCell, GuestActionCell } from "../cells";

interface CreateGuestColumnsOptions {
  scopes: Set<Scope>;
  onUpdate?: (data: { id: string; memberId: string; role: Role }) => void;
  onDelete?: (data: GuestRow) => void;
}

export function createGuestColumns({
  scopes,
  onUpdate,
  onDelete,
}: CreateGuestColumnsOptions): ColumnDef<GuestRow>[] {
  return [
    {
      id: "user",
      accessorKey: "user",
      header: ({ table, column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-[220px] items-center gap-4">
            <Checkbox
              size="sm"
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
            <SortingToggle
              title={<Trans i18nKey="tables.people.columns.user" />}
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex w-[220px] items-center gap-4">
          <Checkbox
            size="sm"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
          <UserCell user={row.original.user} />
        </div>
      ),
      filterFn: userFilterFn,
      enableHiding: false,
    },
    ...(scopes.has(Scope.MemberUpdate)
      ? [
          {
            accessorKey: "access",
            header: () => (
              <TextCell
                value={<Trans i18nKey="tables.people.columns.access" />}
                className="pl-2"
              />
            ),
            cell: ({ row }: { row: Row<GuestRow> }) => (
              <AccessCell access={row.original.access} />
            ),
          },
          {
            id: "actions",
            cell: ({ row }: { row: Row<GuestRow> }) => (
              <div className="flex items-center justify-end">
                <GuestActionCell
                  name={row.original.user.name}
                  onUpdate={() =>
                    onUpdate?.({
                      id: row.original.user.id,
                      memberId: row.original.id,
                      role: Role.MEMBER,
                    })
                  }
                  onDelete={() => onDelete?.(row.original)}
                />
              </div>
            ),
          },
        ]
      : []),
  ];
}
