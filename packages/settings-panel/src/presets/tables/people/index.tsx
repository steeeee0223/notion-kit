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
import { getGuestColumns, getMemberColumns, groupColumns } from "./columns";
import { getInvitationColumns } from "./columns/invitations";
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
  onTeamspaceSelect?: (teamspaceId: string) => void;
}

export const MembersTable = memo<MembersTableProps>(
  ({
    accountId: memberId,
    scopes,
    onUpdate,
    onDelete,
    onTeamspaceSelect,
    ...props
  }) => {
    const columns = useMemo(
      () =>
        getMemberColumns({
          scopes,
          memberId,
          onUpdate,
          onDelete,
          onTeamspaceSelect,
        }),
      [memberId, scopes, onUpdate, onDelete, onTeamspaceSelect],
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

interface InvitationsTableProps {
  scopes: Set<Scope>;
  data: InvitationRow[];
  onCancel?: (id: string) => void;
}

export const InvitationsTable = memo<InvitationsTableProps>(
  ({ data, ...props }) => {
    const columns = useMemo(() => getInvitationColumns(props), [props]);
    return (
      <DataTable columns={columns} data={data} emptyResult="No invitations" />
    );
  },
);
