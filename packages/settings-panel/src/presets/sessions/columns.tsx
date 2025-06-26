import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@notion-kit/shadcn";
import { toDateString } from "@notion-kit/utils";

import type { SessionRow } from "../../lib";
import { DeviceCell, SortingToggle, TextCell } from "./cells";

interface CreateSessionColumnsOptions {
  currentSessionId?: string;
  onLogout?: (deviceName: string, token: string) => void;
}

export function createSessionColumns({
  currentSessionId,
  onLogout,
}: CreateSessionColumnsOptions): ColumnDef<SessionRow>[] {
  return [
    {
      accessorKey: "device",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-3/10 min-w-50 items-center">
            <SortingToggle
              title="Device Name"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => {
        const { id, device, type } = row.original;
        return (
          <DeviceCell
            device={device}
            type={type}
            isCurrent={currentSessionId === id}
          />
        );
      },
    },
    {
      accessorKey: "lastActive",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-1/4 items-center">
            <SortingToggle
              title="Last Active"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => {
        const dateStr = toDateString(row.original.lastActive);
        return <TextCell value={dateStr} />;
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-3/10 items-center">
            <SortingToggle
              title="Location"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => {
        return <TextCell value={row.original.location} />;
      },
    },
    {
      id: "action",
      header: () => <div className="w-1/10" />,
      cell: ({ row }) => {
        return (
          <Button
            size="xs"
            className="h-7 px-2 text-secondary"
            onClick={() => onLogout?.(row.original.device, row.original.token)}
          >
            Logout
          </Button>
        );
      },
    },
  ];
}
