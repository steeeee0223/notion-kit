"use client";

import { memo, useMemo } from "react";

import type { SessionRow } from "../../lib";
import { createSessionColumns } from "./columns";
import { DataTable } from "./data-table";

interface SessionsTableProps {
  className?: string;
  currentSessionId?: string;
  data: SessionRow[];
  onLogout?: (deviceName: string, token: string) => void;
}

export const SessionsTable = memo<SessionsTableProps>(
  ({ className, data, ...props }) => {
    const columns = useMemo(() => createSessionColumns(props), [props]);
    return <DataTable className={className} columns={columns} data={data} />;
  },
);
