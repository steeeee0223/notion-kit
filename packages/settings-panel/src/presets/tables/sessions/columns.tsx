import type { ColumnDef, Row } from "@tanstack/react-table";

import { Trans, useTranslation } from "@notion-kit/i18n";
import { Button, Dialog, DialogTrigger } from "@notion-kit/ui/primitives";
import { toDateString } from "@notion-kit/utils";

import type { SessionRow } from "@/lib/types";
import { LogoutConfirm } from "@/presets/modals";
import { SortingToggle, TextCell } from "@/presets/tables/common-cells";

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
              title={<Trans i18nKey="tables.sessions.columns.device-name" />}
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
              title={<Trans i18nKey="tables.sessions.columns.last-active" />}
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
              title={<Trans i18nKey="tables.sessions.columns.location" />}
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
        return <LogoutCell row={row} onLogout={onLogout} />;
      },
    },
  ];
}

const LogoutCell = ({
  row,
  onLogout,
}: {
  row: Row<SessionRow>;
  onLogout?: (token: string) => void;
}) => {
  const { t } = useTranslation("settings");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="xs" className="h-7 px-2 text-secondary">
          {t("tables.sessions.actions.logout")}
        </Button>
      </DialogTrigger>
      <LogoutConfirm
        title={t("tables.sessions.actions.logout-confirm-title", {
          device: row.original.device,
        })}
        description={t("tables.sessions.actions.logout-confirm-desc")}
        onConfirm={() => onLogout?.(row.original.token)}
      />
    </Dialog>
  );
};
