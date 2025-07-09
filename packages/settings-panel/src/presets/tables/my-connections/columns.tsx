"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { Connection } from "../../../lib";
import { ActionCell, ConnectionCell, Header } from "./cells";

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
      header: () => <Header title="Connection" />,
      cell: ({ row }) => <ConnectionCell {...row.getValue("connection")} />,
    },
    {
      accessorKey: "scopes",
      header: () => <Header title="Access" />,
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          {row.getValue<string[]>("scopes").map((scope, i) => (
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
