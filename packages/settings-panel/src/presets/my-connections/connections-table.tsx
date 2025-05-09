"use client";

import React, { useMemo } from "react";

import type { Connection } from "../../lib";
import { getConnectionColumns, GetConnectionColumnsOptions } from "./columns";
import { DataTable } from "./data-table";

interface ConnectionsTableProps extends GetConnectionColumnsOptions {
  data: Connection[];
}

export const ConnectionsTable: React.FC<ConnectionsTableProps> = ({
  data,
  ...actions
}) => {
  const columns = useMemo(() => getConnectionColumns(actions), [actions]);
  return <DataTable columns={columns} data={data} />;
};
