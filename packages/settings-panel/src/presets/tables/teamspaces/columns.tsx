import type { ColumnDef } from "@tanstack/react-table";

import { toDateString } from "@notion-kit/utils";

import type { Scope, TeamspaceRow } from "../../../lib";
import { SortingToggle, TextCell } from "../common-cells";
import {
  AccessSelectCell,
  OwnersCell,
  TeamspaceActionCell,
  TeamspaceCell,
} from "./cells";

interface CreateTeamspaceColumnsOptions {
  scopes: Set<Scope>;
  workspace: string;
  onLeave?: () => void | Promise<void>;
  onArchive?: () => void | Promise<void>;
}

export function createTeamspaceColumns({
  workspace,
  onLeave,
  onArchive,
}: CreateTeamspaceColumnsOptions): ColumnDef<TeamspaceRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-[35%] items-center">
            <SortingToggle
              title="Teamspace"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <TeamspaceCell
          name={row.original.name}
          icon={row.original.icon}
          memberCount={row.original.memberCount}
        />
      ),
    },
    {
      accessorKey: "owners",
      header: () => (
        <div className="flex w-1/4 min-w-15 items-center">
          <TextCell header value="Owners" />
        </div>
      ),
      cell: ({ row }) => <OwnersCell {...row.original.owners} />,
    },
    {
      accessorKey: "permission",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-[90px] items-center px-2">
            <SortingToggle
              title="Access"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <AccessSelectCell
          workspace={workspace}
          permission={row.original.permission}
        />
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex w-[15%] items-center">
            <SortingToggle
              title="Updated"
              isSorted={isSorted}
              toggle={() => column.toggleSorting(isSorted === "asc")}
            />
          </div>
        );
      },
      cell: ({ row }) => {
        const updatedAt = toDateString(row.original.updatedAt);
        return <TextCell className="text-sm text-primary" value={updatedAt} />;
      },
    },
    {
      id: "actions",
      cell: () => (
        <div className="flex min-w-[52px] items-center justify-end">
          <TeamspaceActionCell onArchive={onArchive} onLeave={onLeave} />
        </div>
      ),
    },
  ];
}
