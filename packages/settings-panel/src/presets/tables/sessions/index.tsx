"use client";

import { memo, useMemo } from "react";

import { cn } from "@notion-kit/cn";

import type { SessionRow } from "../../../lib";
import { DataTable } from "../data-table";
import { createSessionColumns } from "./columns";

interface SessionsTableProps {
  className?: string;
  currentSessionId?: string;
  data: SessionRow[];
  onLogout?: (token: string) => void;
}

export const SessionsTable = memo<SessionsTableProps>(
  ({ className, data, ...props }) => {
    const columns = useMemo(() => createSessionColumns(props), [props]);
    return (
      <DataTable
        className={className}
        columns={columns}
        data={data}
        getHeaderClassName={(id) =>
          cn(
            id === "device" && "w-3/10",
            id === "lastActive" && "w-1/4",
            id === "location" && "w-3/10",
            id === "action" && "w-1/10",
          )
        }
      />
    );
  },
);
