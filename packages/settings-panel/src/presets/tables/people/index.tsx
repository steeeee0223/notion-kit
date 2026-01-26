"use client";

import { useMemo } from "react";

import { cn } from "@notion-kit/cn";
import type { Role } from "@notion-kit/schemas";

import type {
  GroupOption,
  GuestRow,
  InvitationRow,
  MemberRow,
  Scope,
} from "../../../lib";
import { DataTable } from "../data-table";
import {
  createGuestColumns,
  createInvitationColumns,
  createMemberColumns,
  groupColumns,
} from "./columns";

interface MembersTableProps {
  /**
   * @prop userId of the current user
   */
  userId?: string;
  scopes: Set<Scope>;
  data: MemberRow[];
  search?: string;
  onUpdate?: (data: { id: string; memberId: string; role: Role }) => void;
  onDelete?: (data: MemberRow) => void;
  onTeamspaceSelect?: (teamspaceId: string) => void;
}

export function MembersTable({
  userId,
  scopes,
  search,
  onUpdate,
  onDelete,
  onTeamspaceSelect,
  ...props
}: MembersTableProps) {
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
  return (
    <DataTable
      columns={columns}
      initialColumnPinning={["user"]}
      search={{ id: "user", value: search }}
      emptyResult="No members"
      getHeaderClassName={(headerId) =>
        cn(
          headerId === "user" && "w-55",
          headerId === "teamspaces" && "min-w-[175px]",
          headerId === "groups" && "min-w-30",
          headerId === "role" && "min-w-30",
          headerId === "actions" && "w-13",
        )
      }
      {...props}
    />
  );
}

interface GuestsTableProps {
  scopes: Set<Scope>;
  data: GuestRow[];
  search?: string;
  onUpdate?: (data: { id: string; memberId: string; role: Role }) => void;
  onDelete?: (data: GuestRow) => void;
}

export function GuestsTable({
  scopes,
  search,
  onUpdate,
  onDelete,
  ...props
}: GuestsTableProps) {
  const columns = useMemo(
    () => createGuestColumns({ scopes: new Set(scopes), onUpdate, onDelete }),
    [scopes, onUpdate, onDelete],
  );
  return (
    <DataTable
      columns={columns}
      initialColumnPinning={["user"]}
      search={{ id: "user", value: search }}
      emptyResult="No guests"
      getHeaderClassName={(headerId) =>
        cn(
          headerId === "user" && "w-55",
          headerId === "access" && "w-[180px]",
          headerId === "actions" && "w-13",
        )
      }
      {...props}
    />
  );
}

interface GroupsTableProps {
  data: GroupOption[];
  search?: string;
}

export function GroupsTable({ search, ...props }: GroupsTableProps) {
  return (
    <DataTable
      columns={groupColumns}
      emptyResult="No groups"
      search={{ id: "group", value: search }}
      {...props}
    />
  );
}

interface InvitationsTableProps {
  search?: string;
  scopes: Set<Scope>;
  data: InvitationRow[];
  onCancel?: (id: string) => void;
}

export function InvitationsTable({
  data,
  search,
  ...props
}: InvitationsTableProps) {
  const columns = useMemo(() => createInvitationColumns(props), [props]);
  return (
    <DataTable
      columns={columns}
      data={data}
      initialColumnPinning={["email"]}
      search={{ id: "email", value: search }}
      emptyResult="No invitations"
      getHeaderClassName={(headerId) =>
        cn(
          headerId === "email" && "w-55",
          headerId === "invitedBy" && "w-55",
          headerId === "role" && "min-w-40",
          headerId === "status" && "min-w-30",
          headerId === "actions" && "w-13",
        )
      }
    />
  );
}
