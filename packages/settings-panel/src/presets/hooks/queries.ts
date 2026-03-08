"use client";

import { useQuery } from "@tanstack/react-query";

import { useSettingsApi } from "@/core/settings-provider";
import { createDefaultFn, QUERY_KEYS } from "@/lib/queries";
import type {
  AccountStore,
  BillingStore,
  Emojis,
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
  const { account } = useSettingsApi();

  return useQuery<AccountStore, Error, T>({
    initialData: initialAccountStore,
    queryKey: QUERY_KEYS.account(initialAccountStore.id),
    queryFn: account?.getAll ?? createDefaultFn(initialAccountStore),
    select: selector,
    enabled: !!account,
  });
}

export function useWorkspace<T = WorkspaceStore>(
  selector?: (data: WorkspaceStore) => T,
) {
  const { workspace } = useSettingsApi();

  return useQuery<WorkspaceStore, Error, T>({
    initialData: initialWorkspaceStore,
    queryKey: QUERY_KEYS.workspace(initialWorkspaceStore.id),
    queryFn: workspace?.getAll ?? createDefaultFn(initialWorkspaceStore),
    select: selector,
    enabled: !!workspace,
  });
}

export function usePeople<T = Memberships>(
  selector?: (data: Memberships) => T,
) {
  const { people } = useSettingsApi();
  const { data: workspace } = useWorkspace();

  return useQuery<Memberships, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.members(workspace.id),
    queryFn: people?.getAll ?? createDefaultFn({}),
    select: selector,
    enabled: !!people,
  });
}

export function useInvitations<T = Invitations>(
  selector?: (data: Invitations) => T,
) {
  const { invitations } = useSettingsApi();
  const { data: workspace } = useWorkspace();

  return useQuery<Invitations, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.invitations(workspace.id),
    queryFn: invitations?.getAll ?? createDefaultFn({}),
    select: selector,
    enabled: !!invitations,
  });
}

export function useTeamspaces<T = Teamspaces>(
  selector?: (data: Teamspaces) => T,
) {
  const { teamspaces } = useSettingsApi();
  const { data: workspace } = useWorkspace();

  return useQuery<Teamspaces, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.teamspaces(workspace.id),
    queryFn: teamspaces?.getAll ?? createDefaultFn({}),
    select: selector,
    enabled: !!teamspaces,
  });
}

export function useBilling<T = BillingStore>(
  selector?: (data: BillingStore) => T,
) {
  const { billing } = useSettingsApi();
  const { data: workspace } = useWorkspace();

  return useQuery<BillingStore, Error, T>({
    initialData: initialBillingStore,
    queryKey: QUERY_KEYS.billing(workspace.id),
    queryFn: billing?.getAll ?? createDefaultFn(initialBillingStore),
    select: selector,
    enabled: !!billing,
  });
}

export function useEmoji<T = Emojis>(selector?: (data: Emojis) => T) {
  const { emoji } = useSettingsApi();
  const { data: workspace } = useWorkspace();

  return useQuery<Emojis, Error, T>({
    initialData: {},
    queryKey: QUERY_KEYS.emoji(workspace.id),
    queryFn: emoji?.getAll ?? createDefaultFn({}),
    select: selector,
    enabled: !!emoji,
  });
}
