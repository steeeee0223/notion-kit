import { useMemo } from "react";

import { cn } from "@notion-kit/cn";

import type { Connection } from "@/lib/types";
import { DataTable } from "@/presets/tables/data-table";

import {
  createConnectionColumns,
  type CreateConnectionColumnsOptions,
} from "./columns";

interface ConnectionsTableProps extends CreateConnectionColumnsOptions {
  data: Connection[];
}

export function ConnectionsTable({
  data,
  onCreateConnection,
  onDisconnect,
}: ConnectionsTableProps) {
  const columns = useMemo(
    () => createConnectionColumns({ onCreateConnection, onDisconnect }),
    [onCreateConnection, onDisconnect],
  );
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
