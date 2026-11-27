"use client";

import { useEffect, useState, useTransition } from "react";

import type { Organization } from "@notion-kit/auth/client";
import { Plan, Role, type Workspace } from "@notion-kit/schemas";

import { displayRole } from "../adapters/utils";
import {
  useActiveWorkspace,
  useAuth,
  useListWorkspaces,
  useSession,
} from "../auth-provider";
import { handleError, parseWorkspaceIcon } from "../lib";
import { WorkspaceSwitcherMenu } from "./workspace-switcher-menu";

export interface WorkspaceSwitcherProps {
  onWorkspaceChange?: (workspace: Pick<Organization, "id" | "slug">) => void;
  onSignedOut?: () => void;
  onCreateAccount?: () => void;
  onCreateWorkspace?: () => void;
  onOpenSettings?: () => void;
  onInviteMembers?: () => void;
}

type Membership = Pick<Workspace, "memberCount" | "role">;

interface WorkspaceMemberships {
  organizations: Organization[];
  userId: string;
  byOrganization: Map<string, Membership>;
}

export function WorkspaceSwitcher({
  onWorkspaceChange,
  onSignedOut,
  ...menuActions
}: WorkspaceSwitcherProps) {
  const { auth, redirect } = useAuth();
  const { data: session } = useSession();
  const { data: activeOrganization } = useActiveWorkspace();
  const { data: organizations } = useListWorkspaces();
  const userId = session?.user.id;
  const [memberships, setMemberships] = useState<WorkspaceMemberships>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!organizations?.length || !userId) return;

    let cancelled = false;
    void Promise.allSettled(
      organizations.map(async ({ id }) => {
        const { data, error } = await auth.organization.listMembers({
          query: { organizationId: id },
        });
        if (error) return;
        const role = data.members.find(
          (member) => member.userId === userId,
        )?.role;
        return {
          id,
          membership: {
            memberCount: data.total,
            role: role ? displayRole(role) : Role.MEMBER,
          },
        };
      }),
    ).then((results) => {
      if (cancelled) return;
      const byOrganization = new Map<string, Membership>();
      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          byOrganization.set(result.value.id, result.value.membership);
        }
      }
      setMemberships({ organizations, userId, byOrganization });
    });

    return () => {
      cancelled = true;
    };
  }, [auth, organizations, userId]);

  if (!session) return null;

  const currentMemberships =
    memberships?.userId === session.user.id &&
    memberships.organizations === organizations
      ? memberships.byOrganization
      : undefined;

  function toWorkspace(organization: Organization): Workspace {
    const membership = currentMemberships?.get(organization.id);
    return {
      id: organization.id,
      name: organization.name,
      icon: parseWorkspaceIcon(organization.logo, organization.name),
      plan: Plan.FREE,
      role: membership?.role ?? Role.MEMBER,
      memberCount: membership?.memberCount ?? 1,
    };
  }

  async function selectWorkspace(id: string) {
    const result = await auth.organization.setActive({ organizationId: id });
    if (result.error) {
      handleError(result, "Switch workspace error");
      return;
    }
    onWorkspaceChange?.({ id: result.data.id, slug: result.data.slug });
  }

  async function signOut() {
    const result = await auth.signOut();
    if (result.error) {
      handleError(result, "Sign out error");
      return;
    }
    if (onSignedOut) onSignedOut();
    else redirect?.("/");
  }

  return (
    <WorkspaceSwitcherMenu
      {...menuActions}
      user={session.user}
      activeWorkspace={
        activeOrganization ? toWorkspace(activeOrganization) : undefined
      }
      workspaces={organizations?.map(toWorkspace) ?? []}
      disabled={isPending}
      onSelect={(id) => startTransition(() => selectWorkspace(id))}
      onLogout={() => startTransition(signOut)}
    />
  );
}
