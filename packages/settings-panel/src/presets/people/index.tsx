"use client";

import React, { memo, useMemo } from "react";

import { Role } from "@notion-kit/schemas";

import { Scope } from "../../lib";
import type { GroupOption, GuestRow, MemberRow } from "../../lib";
import { getGuestColumns, getMemberColumns, groupColumns } from "./columns";
import { DataTable } from "./data-table";

interface MembersTableProps {
  /**
   * @prop account - Your Id
   */
  accountId?: string;
  scopes: Set<Scope>;
  data: MemberRow[];
  search?: string;
  onUpdate?: (id: string, role: Role) => void;
  onDelete?: (id: string) => void;
}

export const MembersTable = memo<MembersTableProps>(
  ({ accountId: memberId, scopes, onUpdate, onDelete, ...props }) => {
    const columns = useMemo(
      () => getMemberColumns({ scopes, memberId, onUpdate, onDelete }),
      [memberId, scopes, onUpdate, onDelete],
    );
    return <DataTable columns={columns} emptyResult="No members" {...props} />;
  },
);

interface GuestsTableProps {
  scopes: Set<Scope>;
  data: GuestRow[];
  search?: string;
  onUpdate?: (id: string, role: Role) => void;
  onDelete?: (id: string, name: string) => void;
}

export const GuestsTable = memo<GuestsTableProps>(
  ({ scopes, onUpdate, onDelete, ...props }) => {
    const columns = useMemo(
      () => getGuestColumns(new Set(scopes), onUpdate, onDelete),
      [scopes, onUpdate, onDelete],
    );
    return <DataTable columns={columns} emptyResult="No guests" {...props} />;
  },
);

interface GroupsTableProps {
  data: GroupOption[];
  search?: string;
}

export const GroupsTable = memo<GroupsTableProps>(({ ...props }) => {
  return (
    <DataTable columns={groupColumns} emptyResult="No groups" {...props} />
  );
});
