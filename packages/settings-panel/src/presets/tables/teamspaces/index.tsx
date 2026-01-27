"use client";

import { useMemo } from "react";

import { cn } from "@notion-kit/cn";
import type { IconData } from "@notion-kit/icon-block";

import type {
  TeamMemberRow,
  TeamspacePermission,
  TeamspaceRole,
  TeamspaceRow,
} from "../../../lib";
import { DataTable } from "../data-table";
import { createTeamMembersColumns, createTeamspaceColumns } from "./columns";

interface TeamspacesTableProps {
  className?: string;
  data: TeamspaceRow[];
  workspace: string;
  onRowSelect?: (teamspace: TeamspaceRow) => void;
  onUpdate?: (data: {
    id: string;
    name?: string;
    icon?: IconData;
    description?: string;
    permission?: TeamspacePermission;
  }) => void | Promise<void>;
  onArchive?: (teamspace: TeamspaceRow) => void | Promise<void>;
  onLeave?: (teamspace: TeamspaceRow) => void | Promise<void>;
}

export function TeamspacesTable({
  className,
  data,
  workspace,
  onUpdate,
  onArchive,
  onLeave,
  onRowSelect,
}: TeamspacesTableProps) {
  const columns = useMemo(
    () =>
      createTeamspaceColumns({
        workspace,
        onUpdate,
        onArchive,
        onLeave,
        onViewDetail: onRowSelect,
      }),
    [workspace, onUpdate, onArchive, onLeave, onRowSelect],
  );
  return (
    <DataTable
      className={className}
      columns={columns}
      data={data}
      onRowClick={(row) => onRowSelect?.(row.original)}
      getHeaderClassName={(headerId) =>
        cn(
          headerId === "name" && "w-[35%]",
          headerId === "ownedBy" && "w-1/4 min-w-20",
          headerId === "permission" && "w-[90px]",
          headerId === "updatedAt" && "w-[15%]",
          headerId === "actions" && "min-w-13",
        )
      }
    />
  );
}

interface TeamMembersTableProps {
  data: TeamMemberRow[];
  search?: string;
  onUpdate?: (data: {
    userId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemove?: (userId: string) => void | Promise<void>;
  onSearchChange?: React.Dispatch<React.SetStateAction<string>>;
}

export function TeamMembersTable({
  data,
  search = "",
  onUpdate,
  onRemove,
  onSearchChange,
}: TeamMembersTableProps) {
  const columns = useMemo(
    () => createTeamMembersColumns({ onUpdate, onRemove }),
    [onUpdate, onRemove],
  );
  return (
    <DataTable
      columns={columns}
      data={data}
      columnFilters={[{ id: "user", value: search }]}
      onColumnFiltersChange={(filters) => {
        onSearchChange?.((prev) => {
          const filter =
            typeof filters === "function"
              ? filters([{ id: "user", value: prev }])
              : filters;
          return filter.at(0)?.value as string;
        });
      }}
      getHeaderClassName={(headerId) =>
        cn(headerId === "user" && "w-3/4", headerId === "role" && "w-1/4")
      }
    />
  );
}
