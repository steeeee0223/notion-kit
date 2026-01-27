import { ColumnDef } from "@tanstack/react-table";

import { Button, Dialog, DialogTrigger } from "@notion-kit/shadcn";
import { toDateString } from "@notion-kit/utils";

import type { SessionRow } from "../../../lib";
import { LogoutConfirm } from "../../modals";
import { SortingToggle, TextCell } from "../common-cells";
import { DeviceCell } from "./cells";

interface CreateSessionColumnsOptions {
  currentSessionId?: string;
  onLogout?: (token: string) => void;
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
          <div className="flex items-center">
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
          <div className="flex items-center">
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
          <div className="flex items-center">
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
      cell: ({ row }) => {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="xs" className="h-7 px-2 text-secondary">
                Logout
              </Button>
            </DialogTrigger>
            <LogoutConfirm
              title={`Log out of ${row.original.device}?`}
              description="You will be logged out of this device."
              onConfirm={() => onLogout?.(row.original.token)}
            />
          </Dialog>
        );
      },
    },
  ];
}
