"use client";

import { useMemo } from "react";
import { v4 } from "uuid";

import type { WorkspaceMetadata } from "@notion-kit/auth";
import { IconObject, Plan, Role, type IconData } from "@notion-kit/schemas";
import type { WorkspaceAdapter } from "@notion-kit/settings-panel";

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

function parseIcon(logo: string | null | undefined, name: string): IconData {
  try {
    const res = IconObject.safeParse(JSON.parse(logo ?? ""));
    if (res.success) return res.data;
  } catch {
    // use default text icon
  }
  return { type: "text", src: name };
}

function parseInviteLink(
  metadata: string | null | undefined,
  baseURL: string,
): string {
  try {
    const parsed = JSON.parse(metadata ?? "") as WorkspaceMetadata;
    if (parsed.inviteToken) return `${baseURL}/invite/${parsed.inviteToken}`;
  } catch {
    // no invite link
  }
  return "";
}

export function useWorkspaceAdapter(): WorkspaceAdapter | undefined {
  const { auth, baseURL, redirect } = useAuth();
  const orgApi = auth.organization;
  const orgExtraApi = auth.organizationExtra;

  const { data: session } = useSession();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;

  return useMemo<WorkspaceAdapter | undefined>(() => {
    if (!organizationId || !session) return undefined;

    return {
      getAll: async () => {
        const { data } = await orgExtraApi.getWorkspaceDetail({
          query: { organizationId },
        });
        if (!data) {
          return {
            id: organizationId,
            name: workspace.name,
            icon: parseIcon(workspace.logo, workspace.name),
            slug: workspace.slug,
            inviteLink: "",
            role: Role.OWNER,
            plan: Plan.FREE,
          };
        }
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          icon: parseIcon(data.logo, data.name),
          inviteLink: parseInviteLink(data.metadata, baseURL),
          role: data.role as Role,
          plan: planFromString(data.plan),
        };
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
  }, [
    orgApi,
    orgExtraApi,
    organizationId,
    workspace,
    session,
    baseURL,
    redirect,
  ]);
}
