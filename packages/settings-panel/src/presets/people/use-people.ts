"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Role, User } from "@notion-kit/schemas";

import { useSettings } from "../../core";
import {
  createDefaultFn,
  InvitationRow,
  Memberships,
  QUERY_KEYS,
  type WorkspaceMemberships,
} from "../../lib";

export function usePeople<T = Memberships>(
  selector?: (data: Memberships) => T,
) {
  const {
    settings: { workspace },
    people: actions,
  } = useSettings();

  return useQuery<Memberships, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.members(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn({}),
    select: selector,
  });
}

export function useInvitations<T = InvitationRow[]>(
  selector?: (data: InvitationRow[]) => T,
) {
  const {
    settings: { workspace },
    invitations: actions,
  } = useSettings();

  return useQuery<InvitationRow[], Error, T>({
    initialData: [],
    queryKey: QUERY_KEYS.invitations(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn([]),
    select: selector,
  });
}

const defaultOptions = { current: null, options: [] };

export function useWorkspaceMemberships() {
  const { data } = usePeople((res) =>
    Object.values(res).reduce<WorkspaceMemberships>(
      (acc, member) => {
        if (member.role === Role.GUEST) {
          acc.guests.push({ ...member, access: [] });
        } else {
          acc.members.push({
            ...member,
            teamspaces: defaultOptions,
            groups: defaultOptions,
          });
        }
        return acc;
      },
      { members: [], guests: [], invitations: [] },
    ),
  );
  const { data: invitations } = useInvitations();
  return useMemo(() => ({ ...data, invitations }), [data, invitations]);
}

export function useInvitedMembers() {
  const { data: people } = usePeople((res) =>
    Object.values(res).map((mem) => mem.user),
  );
  const { data: invitations } = useInvitations((res) =>
    res.map<User>((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      name: invitation.email,
      avatarUrl: "",
    })),
  );

  return useMemo(() => [...people, ...invitations], [people, invitations]);
}

export function useGuestsCount() {
  const { data } = usePeople((res) =>
    Object.values(res).reduce(
      (acc, member) => (member.role === Role.GUEST ? acc + 1 : acc),
      0,
    ),
  );
  return data;
}
