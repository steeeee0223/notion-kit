"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSettings, useSettingsApi } from "@/core/settings-provider";
import { createDefaultFn, QUERY_KEYS } from "@/lib/queries";
import type {
  AccountStore,
  BillingStore,
  Invitations,
  Memberships,
  Teamspaces,
  WorkspaceStore,
} from "@/lib/types";

import {
  initialAccountStore,
  initialBillingStore,
  initialWorkspaceStore,
} from "./constants";

export function useAccount<T = AccountStore>(
  selector?: (data: AccountStore) => T,
) {
  const queryClient = useQueryClient();
  const {
    settings: { account },
  } = useSettings();
  const initialData = { ...initialAccountStore, id: account.id };

  const queryResult = useQuery<AccountStore, Error, T>({
    initialData,
    queryKey: QUERY_KEYS.account(account.id),
    queryFn: createDefaultFn(initialData),
    select: selector,
    enabled: false,
  });
  useEffect(() => {
    queryClient.setQueryData(QUERY_KEYS.account(account.id), account);
  }, [account, queryClient]);

  return queryResult;
}

export function useWorkspace<T = WorkspaceStore>(
  selector?: (data: WorkspaceStore) => T,
) {
  const queryClient = useQueryClient();
  const {
    settings: { workspace },
  } = useSettings();
  const initialData = { ...initialWorkspaceStore, id: workspace.id };

  const queryResult = useQuery<WorkspaceStore, Error, T>({
    initialData,
    queryKey: QUERY_KEYS.workspace(workspace.id),
    queryFn: createDefaultFn(initialData),
    select: selector,
  });
  useEffect(() => {
    queryClient.setQueryData(QUERY_KEYS.workspace(workspace.id), workspace);
  }, [workspace, queryClient]);

  return queryResult;
}

export function usePeople<T = Memberships>(
  selector?: (data: Memberships) => T,
) {
  const { people: actions } = useSettingsApi();
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
  const { invitations: actions } = useSettingsApi();
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
  const { teamspaces: actions } = useSettingsApi();
  const { data: workspace } = useWorkspace();

  return useQuery<Teamspaces, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.teamspaces(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn({}),
    select: selector,
  });
}

export function useBilling<T = BillingStore>(
  selector?: (data: BillingStore) => T,
) {
  const { billing: actions } = useSettingsApi();
  const { data: workspace } = useWorkspace();

  return useQuery<BillingStore, Error, T>({
    initialData: initialBillingStore,
    queryKey: QUERY_KEYS.billing(workspace.id),
    queryFn: actions?.getAll ?? createDefaultFn(initialBillingStore),
    select: selector,
  });
}
