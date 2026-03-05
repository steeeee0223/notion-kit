"use client";

import { useMemo } from "react";

import type { WorkspaceMetadata } from "@notion-kit/auth";
import { IconObject, Plan, Role, type IconData } from "@notion-kit/schemas";
import type {
  AccountStore,
  SettingsAdapters,
  SettingsStore,
} from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth, useSession } from "../auth-provider";
import { useAccountAdapter } from "./use-account-adapter";
import { useBillingAdapter } from "./use-billing-adapter";
import { useConnectionsAdapter } from "./use-connections-adapter";
import { useInvitationsAdapter } from "./use-invitations-adapter";
import { usePasskeysAdapter } from "./use-passkeys-adapter";
import { usePeopleAdapter } from "./use-people-adapter";
import { useSessionsAdapter } from "./use-sessions-adapter";
import { useTeamspacesAdapter } from "./use-teamspaces-adapter";
import { useWorkspaceAdapter } from "./use-workspace-adapter";

const initialAccountStore: AccountStore = {
  hasPassword: false,
  id: "",
  name: "",
  preferredName: "",
  email: "",
  avatarUrl: "",
  language: "en",
  currentSessionId: "",
};

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

export function useSettingsStore(): SettingsStore {
  const { baseURL } = useAuth();
  const { data: session } = useSession();
  const { data: workspace } = useActiveWorkspace();

  const accountStore = useMemo<AccountStore>(() => {
    if (!session) return initialAccountStore;
    return {
      hasPassword: true,
      id: session.user.id,
      name: session.user.name,
      preferredName: session.user.preferredName || session.user.name,
      email: session.user.email,
      avatarUrl: session.user.image ?? "",
      language: session.user.lang as AccountStore["language"],
      currentSessionId: session.session.id,
      timezone: session.user.tz ?? undefined,
    };
  }, [session]);

  const workspaceStore = useMemo(() => {
    if (!workspace || !session) {
      return {
        id: "",
        name: "",
        icon: { type: "text" as const, src: "" },
        slug: "",
        inviteLink: "",
        plan: Plan.FREE,
        role: Role.OWNER,
      };
    }
    const user = workspace.members.find((m) => m.userId === session.user.id);
    if (!user) {
      console.error("[useSettingsStore] User not found in workspace members");
      return {
        id: "",
        name: "",
        icon: { type: "text" as const, src: "" },
        slug: "",
        inviteLink: "",
        plan: Plan.FREE,
        role: Role.OWNER,
      };
    }

    let icon: IconData = { type: "text", src: workspace.name };
    try {
      const res = IconObject.safeParse(JSON.parse(workspace.logo ?? ""));
      if (res.success) icon = res.data;
    } catch {
      // use default text icon
    }

    let inviteLink = "";
    try {
      const metadata = JSON.parse(
        workspace.metadata as string,
      ) as WorkspaceMetadata;
      if (metadata.inviteToken) {
        inviteLink = `${baseURL}/invite/${metadata.inviteToken}`;
      }
    } catch {
      // no invite link
    }

    return {
      id: workspace.id,
      name: workspace.name,
      icon,
      slug: workspace.slug,
      inviteLink,
      role: user.role as Role,
      // TODO
      plan: Plan.FREE,
    };
  }, [baseURL, session, workspace]);

  return useMemo(
    () => ({
      account: accountStore,
      workspace: workspaceStore,
    }),
    [accountStore, workspaceStore],
  );
}
