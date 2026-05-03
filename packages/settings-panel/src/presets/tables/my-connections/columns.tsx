import type { ColumnDef } from "@tanstack/react-table";

import { Trans } from "@notion-kit/i18n";

import type { Connection } from "@/lib/types";

import { TextCell } from "../common-cells";
import { ActionCell, ConnectionCell } from "./cells";

export interface CreateConnectionColumnsOptions {
  onCreateConnection?: () => void;
  onDisconnect?: (connection: Connection) => void;
}

export function createConnectionColumns({
  onCreateConnection,
  onDisconnect,
}: CreateConnectionColumnsOptions): ColumnDef<Connection>[] {
  return [
    {
      accessorKey: "connection",
      header: () => (
        <TextCell
          value={<Trans i18nKey="tables.connections.columns.connection" />}
        />
      ),
      cell: ({ row }) => <ConnectionCell {...row.original.connection} />,
    },
    {
      accessorKey: "scopes",
      header: () => (
        <TextCell
          value={<Trans i18nKey="tables.connections.columns.access" />}
        />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          {row.original.scopes.map((scope, i) => (
            <span key={i} className="w-full">
              {scope}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <ActionCell
            onCreateConnection={onCreateConnection}
            onDisconnect={() => onDisconnect?.(row.original)}
          />
        </div>
      ),
    },
  ];
}
