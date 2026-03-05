"use client";

import { useMemo } from "react";
import { v4 } from "uuid";

import type { WorkspaceMetadata } from "@notion-kit/auth";
import { IconObject, Plan, Role, type IconData } from "@notion-kit/schemas";
import type {
  WorkspaceAdapter,
  WorkspaceStore,
} from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth, useSession } from "../auth-provider";

function planFromString(plan: string): Plan {
  const map: Record<string, Plan> = {
    free: Plan.FREE,
    education: Plan.EDUCATION,
    plus: Plan.PLUS,
    business: Plan.BUSINESS,
    enterprise: Plan.ENTERPRISE,
  };
  return map[plan.toLowerCase()] ?? Plan.FREE;
}

export function useWorkspaceAdapter(): WorkspaceAdapter | undefined {
  const { auth, baseURL, redirect } = useAuth();
  const { data: session } = useSession();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const orgApi = auth.organization;
  const subApi = auth.subscription;

  return useMemo<WorkspaceAdapter | undefined>(() => {
    if (!organizationId || !session) return undefined;

    const buildStore = (activePlan?: string): WorkspaceStore => {
      const user = workspace.members.find((m) => m.userId === session.user.id);

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
        role: user ? (user.role as Role) : Role.OWNER,
        plan: activePlan ? planFromString(activePlan) : Plan.FREE,
      };
    };

    return {
      getAll: async () => {
        const { data: subscriptions } = await subApi.list({
          query: {
            referenceId: organizationId,
            customerType: "organization",
          },
        });
        const active = subscriptions?.find(
          (s) => s.status === "active" || s.status === "trialing",
        );
        return buildStore(active?.plan);
      },
      update: async ({ name, icon }) => {
        await orgApi.update(
          {
            organizationId,
            data: {
              name,
              logo: icon ? JSON.stringify(icon) : undefined,
            },
          },
          { throw: true },
        );
      },
      delete: async () => {
        await orgApi.delete(
          { organizationId },
          {
            onSuccess: () => redirect?.("/"),
            throw: true,
          },
        );
      },
      leave: async () => {
        await orgApi.leave(
          { organizationId },
          {
            onSuccess: () => redirect?.("/"),
            throw: true,
          },
        );
      },
      resetLink: async () => {
        await orgApi.update(
          {
            organizationId,
            data: {
              metadata: { inviteToken: v4() } satisfies WorkspaceMetadata,
            },
          },
          { throw: true },
        );
      },
    };
  }, [orgApi, subApi, organizationId, workspace, session, baseURL, redirect]);
}
