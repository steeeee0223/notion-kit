"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { Connection } from "../../../lib";
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
      header: () => <TextCell header value="Connection" />,
      cell: ({ row }) => <ConnectionCell {...row.original.connection} />,
    },
    {
      accessorKey: "scopes",
      header: () => <TextCell header value="Access" />,
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
