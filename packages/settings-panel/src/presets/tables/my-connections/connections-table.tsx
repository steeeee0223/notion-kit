"use client";

import { useMemo } from "react";

import { cn } from "@notion-kit/cn";

import type { Connection } from "../../../lib";
import { DataTable } from "../data-table";
import {
  createConnectionColumns,
  type CreateConnectionColumnsOptions,
} from "./columns";

interface ConnectionsTableProps extends CreateConnectionColumnsOptions {
  data: Connection[];
}

export function ConnectionsTable({ data, ...actions }: ConnectionsTableProps) {
  const columns = useMemo(() => createConnectionColumns(actions), [actions]);
  return (
    <DataTable
      columns={columns}
      data={data}
      getHeaderClassName={(headerId) =>
        cn(headerId === "actions" ? "w-[5%]" : "w-2/5")
      }
    />
  );
}
