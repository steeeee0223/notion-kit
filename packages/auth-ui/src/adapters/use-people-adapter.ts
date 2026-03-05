"use client";

import { useMemo } from "react";

import type { PeopleAdapter } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";
import { handleError } from "../lib";

export function usePeopleAdapter(): PeopleAdapter | undefined {
  const { auth } = useAuth();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const orgApi = auth.organization;

  return useMemo<PeopleAdapter | undefined>(() => {
    if (!organizationId) return undefined;
    return {
      getAll: async () => {
        const result = await orgApi.listMembers({
          query: { organizationId },
        });
        if (!result.data) {
          handleError(result, "Fetch members failed");
          return {};
        }
        return result.data.members.reduce<
          Record<
            string,
            {
              id: string;
              role: import("@notion-kit/schemas").Role;
              user: import("@notion-kit/schemas").User;
            }
          >
        >((acc, m) => {
          acc[m.user.id] = {
            id: m.id,
            role: m.role as import("@notion-kit/schemas").Role,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
              avatarUrl: m.user.image ?? "",
            },
          };
          return acc;
        }, {});
      },
      update: async ({ memberId, role }) => {
        await orgApi.updateMemberRole(
          { organizationId, memberId, role },
          { throw: true },
        );
      },
      delete: async ({ memberId }) => {
        await orgApi.removeMember(
          { organizationId, memberIdOrEmail: memberId },
          { throw: true },
        );
      },
    };
  }, [orgApi, organizationId]);
}
