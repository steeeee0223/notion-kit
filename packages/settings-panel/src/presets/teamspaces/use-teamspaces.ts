"use client";

import { useQuery } from "@tanstack/react-query";

import { useSettings } from "../../core";
import { createDefaultFn, QUERY_KEYS, Teamspaces } from "../../lib";

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
  });
}
