"use client";

import { useMemo } from "react";

import { IconObject, PlanObject, type IconData } from "@notion-kit/schemas";
import type { WorkspaceAdapter } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth, useSession } from "../auth-provider";
import { displayRole } from "./utils";

function parseIcon(logo: string | null | undefined, name: string): IconData {
  try {
    const res = IconObject.safeParse(JSON.parse(logo ?? ""));
    if (res.success) return res.data;
  } catch {
    // use default text icon
  }
  return { type: "text", src: name };
}

export function useWorkspaceAdapter(): WorkspaceAdapter | undefined {
  const { auth, redirect } = useAuth();
  const orgApi = auth.organization;
  const orgExtraApi = auth.organizationExtra;

  const { data: session } = useSession();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;

  return useMemo<WorkspaceAdapter | undefined>(() => {
    if (!organizationId || !session) return undefined;

    return {
      getAll: async () => {
        const { data, error } = await orgExtraApi.getWorkspaceDetail({
          query: { organizationId },
        });
        if (error) throw new Error(error.message);
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          icon: parseIcon(data.logo, data.name),
          inviteLink: "",
          role: displayRole(data.role),
          plan: PlanObject.parse(data.plan.toLowerCase()),
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
    };
  }, [orgApi, orgExtraApi, organizationId, session, redirect]);
}
