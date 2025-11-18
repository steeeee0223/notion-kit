"use client";

import { useQuery } from "@tanstack/react-query";

import { useSettings } from "../../core";
import { createDefaultFn, QUERY_KEYS } from "../../lib";
import type {
  AccountStore,
  Invitations,
  Memberships,
  Teamspaces,
  WorkspaceStore,
} from "../../lib";
import { initialAccountStore, initialWorkspaceStore } from "./constants";

export function useAccount<T = AccountStore>(
  selector?: (data: AccountStore) => T,
) {
  const {
    settings: { account },
    account: actions,
  } = useSettings();

  return useQuery<AccountStore, Error, T>({
    initialData: { ...initialAccountStore, id: account.id },
    queryKey: QUERY_KEYS.account(account.id),
    queryFn: actions?.get ?? createDefaultFn(account),
    select: selector,
  });
}

export function useWorkspace<T = WorkspaceStore>(
  selector?: (data: WorkspaceStore) => T,
) {
  const {
    settings: { workspace },
    workspace: actions,
  } = useSettings();

  return useQuery<WorkspaceStore, Error, T>({
    initialData: { ...initialWorkspaceStore, id: workspace.id },
    queryKey: QUERY_KEYS.workspace(workspace.id),
    queryFn: actions?.get ?? createDefaultFn(workspace),
    select: selector,
  });
}

export function usePeople<T = Memberships>(
  selector?: (data: Memberships) => T,
) {
  const { people: actions } = useSettings();
  const { data: workspace } = useWorkspace();

  return useQuery<Memberships, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.members(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn({}),
    select: selector,
  });
}

export function useInvitations<T = Invitations>(
  selector?: (data: Invitations) => T,
) {
  const { invitations: actions } = useSettings();
  const { data: workspace } = useWorkspace();

  return useQuery<Invitations, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.invitations(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn({}),
    select: selector,
  });
}

export function useTeamspaces<T = Teamspaces>(
  selector?: (data: Teamspaces) => T,
) {
  const { teamspaces: actions } = useSettings();
  const { data: workspace } = useWorkspace();

  return useQuery<Teamspaces, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.teamspaces(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn({}),
    select: selector,
  });
}
