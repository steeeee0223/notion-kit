"use client";

import { useMemo } from "react";

import type { SettingsAdapters } from "@notion-kit/settings-panel";

import { useAccountAdapter } from "./use-account-adapter";
import { useBillingAdapter } from "./use-billing-adapter";
import { useConnectionsAdapter } from "./use-connections-adapter";
import { useInvitationsAdapter } from "./use-invitations-adapter";
import { usePasskeysAdapter } from "./use-passkeys-adapter";
import { usePeopleAdapter } from "./use-people-adapter";
import { useSessionsAdapter } from "./use-sessions-adapter";
import { useTeamspacesAdapter } from "./use-teamspaces-adapter";
import { useWorkspaceAdapter } from "./use-workspace-adapter";

export function useSettingsAdapters() {
  const account = useAccountAdapter();
  const sessions = useSessionsAdapter();
  const passkeys = usePasskeysAdapter();
  const connections = useConnectionsAdapter();
  const workspace = useWorkspaceAdapter();
  const people = usePeopleAdapter();
  const invitations = useInvitationsAdapter();
  const teamspaces = useTeamspacesAdapter();
  const billing = useBillingAdapter();

  const adapters = useMemo<SettingsAdapters>(
    () => ({
      account,
      sessions,
      passkeys,
      connections,
      workspace,
      people,
      invitations,
      teamspaces,
      billing,
    }),
    [
      account,
      sessions,
      passkeys,
      connections,
      workspace,
      people,
      invitations,
      teamspaces,
      billing,
    ],
  );

  return adapters;
}
