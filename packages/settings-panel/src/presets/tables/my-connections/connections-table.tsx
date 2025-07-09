"use client";

import { useMemo } from "react";

import type { Connection } from "../../../lib";
import {
  createConnectionColumns,
  type CreateConnectionColumnsOptions,
} from "./columns";
import { DataTable } from "./data-table";

interface ConnectionsTableProps extends CreateConnectionColumnsOptions {
  data: Connection[];
}

export function ConnectionsTable({ data, ...actions }: ConnectionsTableProps) {
  const columns = useMemo(() => createConnectionColumns(actions), [actions]);
  return <DataTable columns={columns} data={data} />;
}
