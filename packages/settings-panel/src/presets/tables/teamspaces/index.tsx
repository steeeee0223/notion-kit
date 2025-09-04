"use client";

import { memo, useMemo } from "react";

import type { IconData } from "@notion-kit/icon-block";

import type {
  TeamMemberRow,
  TeamspacePermission,
  TeamspaceRole,
  TeamspaceRow,
} from "../../../lib";
import { createTeamMembersColumns, createTeamspaceColumns } from "./columns";
import { DataTable } from "./data-table";

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

export const TeamspacesTable = memo<TeamspacesTableProps>(
  ({
    className,
    data,
    workspace,
    onUpdate,
    onArchive,
    onLeave,
    onRowSelect,
  }: TeamspacesTableProps) => {
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
      />
    );
  },
);

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

export const TeamMembersTable = memo(
  ({
    data,
    search,
    onUpdate,
    onRemove,
    onSearchChange,
  }: TeamMembersTableProps) => {
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
      />
    );
  },
);
