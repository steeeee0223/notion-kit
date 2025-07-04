"use client";

import React, { useMemo } from "react";

import type { Connection } from "../../../lib";
import {
  createConnectionColumns,
  type CreateConnectionColumnsOptions,
} from "./columns";
import { DataTable } from "./data-table";

interface ConnectionsTableProps extends CreateConnectionColumnsOptions {
  data: Connection[];
}

export const ConnectionsTable: React.FC<ConnectionsTableProps> = ({
  data,
  ...actions
}) => {
  const columns = useMemo(() => createConnectionColumns(actions), [actions]);
  return <DataTable columns={columns} data={data} />;
};
