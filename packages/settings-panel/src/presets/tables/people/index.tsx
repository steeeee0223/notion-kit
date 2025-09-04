"use client";

import React, { memo, useMemo } from "react";

import { Role } from "@notion-kit/schemas";

import { Scope } from "../../../lib";
import type {
  GroupOption,
  GuestRow,
  InvitationRow,
  MemberRow,
} from "../../../lib";
import {
  createGuestColumns,
  createMemberColumns,
  groupColumns,
} from "./columns";
import { createInvitationColumns } from "./columns/invitations";
import { DataTable } from "./data-table";

interface MembersTableProps {
  /**
   * @prop userId
   */
  userId?: string;
  scopes: Set<Scope>;
  data: MemberRow[];
  search?: string;
  onUpdate?: (data: { id: string; memberId: string; role: Role }) => void;
  onDelete?: (data: MemberRow) => void;
  onTeamspaceSelect?: (teamspaceId: string) => void;
}

export const MembersTable = memo<MembersTableProps>(
  ({ userId, scopes, onUpdate, onDelete, onTeamspaceSelect, ...props }) => {
    const columns = useMemo(
      () =>
        createMemberColumns({
          scopes,
          userId,
          onUpdate,
          onDelete,
          onTeamspaceSelect,
        }),
      [userId, scopes, onUpdate, onDelete, onTeamspaceSelect],
    );
    return <DataTable columns={columns} emptyResult="No members" {...props} />;
  },
);

interface GuestsTableProps {
  scopes: Set<Scope>;
  data: GuestRow[];
  search?: string;
  onUpdate?: (data: { id: string; memberId: string; role: Role }) => void;
  onDelete?: (data: GuestRow) => void;
}

export const GuestsTable = memo<GuestsTableProps>(
  ({ scopes, onUpdate, onDelete, ...props }) => {
    const columns = useMemo(
      () => createGuestColumns({ scopes: new Set(scopes), onUpdate, onDelete }),
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

interface InvitationsTableProps {
  scopes: Set<Scope>;
  data: InvitationRow[];
  onCancel?: (id: string) => void;
}

export const InvitationsTable = memo<InvitationsTableProps>(
  ({ data, ...props }) => {
    const columns = useMemo(() => createInvitationColumns(props), [props]);
    return (
      <DataTable columns={columns} data={data} emptyResult="No invitations" />
    );
  },
);
