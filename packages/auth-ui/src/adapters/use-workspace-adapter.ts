"use client";

import { useMemo } from "react";
import { v4 } from "uuid";

import type { WorkspaceMetadata } from "@notion-kit/auth";
import type { WorkspaceAdapter } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";

export function useWorkspaceAdapter(): WorkspaceAdapter | undefined {
  const { auth, redirect } = useAuth();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const orgApi = auth.organization;

  return useMemo<WorkspaceAdapter | undefined>(() => {
    if (!organizationId) return undefined;
    return {
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
  }, [orgApi, organizationId, redirect]);
}
