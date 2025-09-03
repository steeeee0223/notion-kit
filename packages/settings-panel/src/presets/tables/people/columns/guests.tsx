import type { ColumnDef, Row } from "@tanstack/react-table";

import { Role } from "@notion-kit/schemas";
import { Checkbox } from "@notion-kit/shadcn";

import { Scope, type GuestRow } from "../../../../lib";
import { SortingToggle, TextCell, UserCell } from "../../common-cells";
import { userFilterFn } from "../../utils";
import { AccessCell, GuestActionCell } from "../cells";

export const getGuestColumns = (
  scopes: Set<Scope>,
  onUpdate?: (data: { id: string; memberId: string; role: Role }) => void,
  onDelete?: (data: { id: string; memberId: string; name: string }) => void,
): ColumnDef<GuestRow, GuestRow>[] => [
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
            title="User"
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
          header: () => <TextCell header value="Access" className="pl-2" />,
          cell: ({ row }: { row: Row<GuestRow> }) => (
            <AccessCell access={row.original.access} />
          ),
        },
        {
          id: "actions",
          cell: ({ row }: { row: Row<GuestRow> }) => {
            const { id, name: preferredName } = row.original.user;
            return (
              <div className="flex min-w-[52px] items-center justify-end">
                <GuestActionCell
                  onUpdate={() =>
                    onUpdate?.({
                      id,
                      memberId: row.original.id,
                      role: Role.MEMBER,
                    })
                  }
                  onDelete={() =>
                    onDelete?.({
                      id,
                      memberId: row.original.id,
                      name: preferredName,
                    })
                  }
                />
              </div>
            );
          },
        },
      ]
    : []),
];
