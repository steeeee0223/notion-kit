"use client";

import { useQuery } from "@tanstack/react-query";

import { Role } from "@notion-kit/schemas";

import { useSettings } from "../../core";
import {
  createDefaultFn,
  Memberships,
  QUERY_KEYS,
  type WorkspaceMemberships,
} from "../../lib";

type Selector<T = Memberships> = (data: Memberships) => T;

export function usePeople<T = Memberships>(selector?: Selector<T>) {
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
      { members: [], guests: [] },
    ),
  );
  return data;
}

export function useInvitedMembers() {
  const { data } = usePeople((res) =>
    Object.values(res).map((mem) => mem.user),
  );
  return data;
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
