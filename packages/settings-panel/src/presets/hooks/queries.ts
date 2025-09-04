"use client";

import { useQuery } from "@tanstack/react-query";

import { useSettings } from "../../core";
import { createDefaultFn, QUERY_KEYS } from "../../lib";
import type { Invitations, Memberships, Teamspaces } from "../../lib";

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
    retry: false,
  });
}

export function useInvitations<T = Invitations>(
  selector?: (data: Invitations) => T,
) {
  const {
    settings: { workspace },
    invitations: actions,
  } = useSettings();

  return useQuery<Invitations, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.invitations(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn({}),
    select: selector,
    retry: false,
  });
}

export function useTeamspaces<T = Teamspaces>(
  selector?: (data: Teamspaces) => T,
) {
  const {
    settings: { workspace },
    teamspaces: actions,
  } = useSettings();

  return useQuery<Teamspaces, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.teamspaces(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn({}),
    select: selector,
    retry: false,
  });
}
