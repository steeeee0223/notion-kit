"use client";

import { memo, useMemo } from "react";

import type { SessionRow } from "../../lib";
import { createSessionColumns } from "./columns";
import { DataTable } from "./data-table";

interface SessionsTableProps {
  currentSessionId?: string;
  data: SessionRow[];
  onLogout?: (sessionId: string) => void;
}

export const SessionsTable = memo<SessionsTableProps>(({ data, ...props }) => {
  const columns = useMemo(() => createSessionColumns(props), [props]);
  return <DataTable columns={columns} data={data} />;
});
